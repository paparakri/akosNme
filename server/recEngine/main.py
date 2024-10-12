from datetime import datetime, timedelta
import json
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from sklearn.decomposition import NMF
from pymongo import MongoClient
from dotenv import load_dotenv
import pandas as pd
import certifi

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

ca = certifi.where()
load_dotenv()
mongo_uri = uri = "mongodb+srv://papakri:Paparakri13!@cluster0.uw0zdqq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
PlinkoDB = MongoClient(mongo_uri, tlsCAFile=ca)['PlinkoDB']

app = Flask(__name__)

cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/recommendations', methods=['POST'])
@cross_origin()
def get_recommendations():
    try:
        user_id = request.json.get('user_id')
        df_reviews, df_clubs, df_users = get_mongo_data()
        recommendations = collaborative_filtering(df_reviews)

        ids = recommendations[user_id]
        displayRecs = []
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


def calculate_hottest(df_clubs, df_reviews, location, limit=10):
    try:
        # Filter clubs by location
        local_clubs = df_clubs[df_clubs['location'] == location].copy()
        if local_clubs.empty:
            print(f"No clubs found for location: {location}")
            return []

        local_clubs.loc[:, '_id'] = local_clubs['_id'].astype(str)

        # Save the original club ratings
        club_ratings = local_clubs[['_id', 'rating']].set_index('_id')

        # Merge clubs with their reviews, keeping all clubs
        club_reviews = pd.merge(local_clubs, df_reviews, left_on='_id', right_on='club', how='left')

        # Check if 'createdAt' column exists, if not, use current timestamp
        if 'createdAt' not in club_reviews.columns:
            print("Warning: 'createdAt' column not found. Using current timestamp.")
            club_reviews['createdAt'] = pd.Timestamp.now()

        # Calculate metrics for each club
        club_metrics = club_reviews.groupby('_id_x').agg({
            'club': 'count',  # Count of reviews
            'createdAt': 'max',
            'displayName': 'first',
            'username': 'first'
        }).reset_index()

        # Rename columns
        club_metrics.columns = ['_id', 'review_count', 'last_review_date', 'displayName', 'username']

        # Merge back the original ratings
        club_metrics = club_metrics.merge(club_ratings, left_on='_id', right_index=True, how='left')

        # Handle NaN values
        club_metrics['review_count'] = club_metrics['review_count'].fillna(0)
        club_metrics['rating'] = club_metrics['rating'].fillna(0)
        club_metrics['last_review_date'] = club_metrics['last_review_date'].fillna(pd.Timestamp.now())

        # Calculate recency score (higher for more recent reviews)
        now = pd.Timestamp.now()
        club_metrics['last_review_date'] = pd.to_datetime(club_metrics['last_review_date'], errors='coerce')
        club_metrics['days_since_last_review'] = (now - club_metrics['last_review_date']).dt.total_seconds() / (24 * 60 * 60)
        club_metrics['recency_score'] = 1 / (club_metrics['days_since_last_review'] + 1)  # Normalize
        
        # Calculate hotness score
        club_metrics['hotness_score'] = (
            club_metrics['review_count'] * 0.3 +
            club_metrics['rating'] * 0.6 +
            club_metrics['recency_score'] * 0.1
        )

        # Sort by hotness score and get top clubs
        top_clubs = club_metrics.sort_values('hotness_score', ascending=False).head(limit)

        # Select required columns
        result_df = top_clubs[['_id', 'displayName', 'username', 'review_count', 'rating', 'hotness_score']].copy()
        
        # Convert any list-type columns to strings
        for column in result_df.columns:
            if result_df[column].dtype == 'object':
                result_df.loc[:, column] = result_df[column].apply(lambda x: json.dumps(x) if isinstance(x, list) else x)

        # Convert to list of dictionaries
        result = result_df.to_dict('records')
        return result
    except Exception as e:
        print(f"Error in calculate_hottest: {str(e)}")
        raise

@app.route('/featured-clubs', methods=["POST"])
@cross_origin()
def get_featured_clubs():
    try:
        location = request.json.get('location')
        if not location:
            return jsonify({'error': 'Location is required for featured clubs.'}), 400
    
        df_reviews, df_clubs, _ = get_mongo_data()
        
        # Print column names for debugging
        print("Reviews columns:", df_reviews.columns.tolist())
        print("Clubs columns:", df_clubs.columns.tolist())
        
        featured_clubs = calculate_hottest(df_clubs, df_reviews, location)

        return jsonify({'featuredClubs': featured_clubs})
    except Exception as e:
        print(f"Error in get_featured_clubs: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
