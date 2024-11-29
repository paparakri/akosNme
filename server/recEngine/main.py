from datetime import datetime, timedelta
import json
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from sklearn.decomposition import NMF
from pymongo import MongoClient
from dotenv import load_dotenv
import pandas as pd
import numpy as np
import certifi
from bson import ObjectId
from ClubScoreManager import ClubScoreManager
from math import radians, sin, cos, sqrt, atan2

def enhanced_json_serializer(obj):
    """Enhanced JSON serializer to handle various non-serializable types"""
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, datetime):
        return obj.isoformat()
    elif isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    elif pd.isna(obj):
        return None
    elif isinstance(obj, (pd.Series, pd.DataFrame)):
        return obj.to_dict()
    return str(obj)

def calculate_distance(lat1, lng1, lat2, lng2):
    """
    Calculate the Haversine distance between two points on earth.
    Returns distance in kilometers.
    """

    print("Calculating distance between coordinates: ({}, {}) and ({}, {})".format(lat1, lng1, lat2, lng2))

    R = 6371  # Earth's radius in kilometers

    lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])
    
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlng/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    distance = R * c
    
    return distance

def calculate_hottest(df_clubs, df_reviews, user_location, limit=100, max_distance=10):
    try:
        if df_clubs.empty:
            print("No clubs found in the database!")
            return []

        # Create a copy of the dataframe to avoid modifying the original
        local_clubs = df_clubs.copy()
        
        # Calculate distances for all clubs
        distances = []
        for _, club in local_clubs.iterrows():
            try:
                club_coords = club['location']['coordinates']
                distance = calculate_distance(
                    user_location['lat'],
                    user_location['lng'],
                    club_coords[1],
                    club_coords[0]
                )
                distances.append(distance)
            except (KeyError, TypeError):
                # If club doesn't have valid coordinates, set distance to infinity
                distances.append(float('inf'))
        
        print(distances)

        # Add distances to the dataframe
        local_clubs['distance'] = distances
        
        # Filter clubs within max_distance
        local_clubs = local_clubs[local_clubs['distance'] <= max_distance]
        
        if local_clubs.empty:
            print(f"No clubs found within {max_distance}km of the user's location")
            return []

        if df_reviews.empty:
            print("There are no reviews for any clubs!")
            result_df = local_clubs[['_id', 'displayName', 'username', 'distance']].head(limit)
            result_df['review_count'] = 0
            result_df['rating'] = local_clubs['rating'].fillna(0)
            result_df['hotness_score'] = 0
            return json.loads(json.dumps(result_df.to_dict('records'), default=enhanced_json_serializer))

        local_clubs.loc[:, '_id'] = local_clubs['_id'].astype(str)
        club_ratings = local_clubs[['_id', 'rating']].set_index('_id')
        club_reviews = pd.merge(local_clubs, df_reviews, left_on='_id', right_on='club', how='left')

        if 'createdAt' not in club_reviews.columns:
            print("Warning: 'createdAt' column not found. Using current timestamp.")
            club_reviews['createdAt'] = pd.Timestamp.now()

        club_metrics = club_reviews.groupby('_id_x').agg({
            'club': 'count',
            'createdAt': 'max',
            'displayName': 'first',
            'username': 'first',
            'distance': 'first'  # Include distance in aggregation
        }).reset_index()

        club_metrics.columns = ['_id', 'review_count', 'last_review_date', 'displayName', 'username', 'distance']

        club_metrics = club_metrics.merge(club_ratings, left_on='_id', right_index=True, how='left')

        club_metrics['review_count'] = club_metrics['review_count'].fillna(0)
        club_metrics['rating'] = club_metrics['rating'].fillna(0)
        club_metrics['last_review_date'] = club_metrics['last_review_date'].fillna(pd.Timestamp.now())

        now = pd.Timestamp.now()
        club_metrics['last_review_date'] = pd.to_datetime(club_metrics['last_review_date'], errors='coerce')
        club_metrics['days_since_last_review'] = (now - club_metrics['last_review_date']).dt.total_seconds() / (24 * 60 * 60)
        club_metrics['recency_score'] = 1 / (club_metrics['days_since_last_review'] + 1)
        
        # Add distance factor to hotness score (closer = better)
        club_metrics['distance_score'] = 1 - (club_metrics['distance'] / max_distance)
        
        club_metrics['hotness_score'] = (
            club_metrics['review_count'] * 0.25 +
            club_metrics['rating'] * 0.5 +
            club_metrics['recency_score'] * 0.1 +
            club_metrics['distance_score'] * 0.15  # Add distance influence
        )

        top_clubs = club_metrics.sort_values('hotness_score', ascending=False).head(limit)
        result_df = top_clubs[['_id', 'displayName', 'username', 'review_count', 'rating', 'hotness_score', 'distance']].copy()

        print("Calculated Results for hottest club: ")
        print(result_df)

        return json.loads(json.dumps(result_df.to_dict('records'), default=enhanced_json_serializer))
    except Exception as e:
        print(f"Error in calculate_hottest: {str(e)}")
        raise

# Perform collaborative filtering using Non-Negative Matrix Factorization (NMF)
def collaborative_filtering(df_reviews):
    try:
        # Create a pivot table with users as rows and items as columns
        pivot_table = df_reviews.pivot(index='user', columns='club', values='rating').fillna(0)

        # Perform NMF on the pivot table
        nmf = NMF(n_components=10, random_state=42)
        nmf.fit(pivot_table)
        
        # Get the user-item matrix factorization
        user_factors = nmf.transform(pivot_table)
        item_factors = nmf.components_
        
        # Calculate the predicted ratings for all users and items
        predicted_ratings = user_factors.dot(item_factors)
        
        # Get the recommendations for each user
        recommendations = {}
        for user_id in df_reviews['user'].unique():
            user_index = pivot_table.index.get_loc(user_id)
            user_ratings = predicted_ratings[user_index]
            top_items_indices = user_ratings.argsort()[::-1][:10]  # Get top 10 recommended items
            top_items_ids = pivot_table.columns[top_items_indices].tolist()
            recommendations[user_id] = top_items_ids

        return recommendations
    except Exception as e:
        print(e)
        return {}

def get_mongo_data():
    
    reviews = PlinkoDB['reviews']
    clubs = PlinkoDB['clubusers']
    normalUsers = PlinkoDB['normalusers']

    df_reviews = pd.DataFrame(list(reviews.find()))
    df_clubs = pd.DataFrame(list(clubs.find()))
    df_users = pd.DataFrame(list(normalUsers.find()))

    return df_reviews, df_clubs, df_users

def get_specific_club_data(club_id):
    club = PlinkoDB['clubusers'].find_one({'_id': ObjectId(club_id)})
    return club

ca = certifi.where()
load_dotenv()
mongo_uri = uri = "mongodb+srv://papakri:Paparakri13!@cluster0.uw0zdqq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
PlinkoDB = MongoClient(mongo_uri, tlsCAFile=ca)['PlinkoDB']

app = Flask(__name__)

cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/featured-clubs', methods=["POST"])
@cross_origin()
def get_featured_clubs():
    try:
        location = request.json.get('location')
        if not location or 'lat' not in location or 'lng' not in location:
            return jsonify({'error': 'Location coordinates (lat, lng) are required.'}), 400
        
        df_reviews, df_clubs, _ = get_mongo_data()
        
        #print("Reviews columns:", df_reviews.columns.tolist())
        #print("Clubs columns:", df_clubs.columns.tolist())
        
        featured_clubs = calculate_hottest(df_clubs, df_reviews, location)

        return jsonify({'featuredClubs': featured_clubs}), 200
    except Exception as e:
        print(f"Error in get_featured_clubs: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/clubs/update-lists', methods=['PUT'])
def update_lists():
    score_manager = ClubScoreManager(PlinkoDB)
    score_manager.bulk_update_scores()
    return "Lists updated"

@app.route('/api/clubs/<string:category>', methods=['GET'])
def get_clubs(category: str):  # Remove async
    try:
        page = request.args.get('page', default=1, type=int)
        score_manager = ClubScoreManager(PlinkoDB)
        clubs = score_manager.get_clubs_by_category(category, page)  # Remove await
        
        # Ensure ObjectId is serialized before returning
        def serialize_object_ids(data):
            if isinstance(data, list):
                return [serialize_object_ids(item) for item in data]
            elif isinstance(data, dict):
                return {key: serialize_object_ids(value) for key, value in data.items()}
            elif isinstance(data, ObjectId):
                return str(data)
            return data

        clubs_serialized = serialize_object_ids(clubs)

        return jsonify(clubs_serialized)  # Return as JSON response
    except Exception as e:
        print(f"Error in get_clubs: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/recommendations', methods=['POST'])
@cross_origin()
def get_recommendations():
    try:
        user_id = request.json.get('user_id')
        df_reviews, df_clubs, df_users = get_mongo_data()
        recommendations = collaborative_filtering(df_reviews)

        ids = recommendations[user_id]
        displayRecs = []
        print('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!Here are the reccomendations i got: ')
        print(recommendations)
        for id in ids:
            for i in range(len(df_clubs['_id'])):
                if str(df_clubs['_id'][i]) == str(id):
                    displayRecs.append(str(df_clubs['username'][i]))

        for i in range(len(df_users['_id'])):
            if str(df_users['_id'][i]) == str(user_id):
                username = df_users['username'][i]

        return jsonify({"recs": displayRecs, "username": username})
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
