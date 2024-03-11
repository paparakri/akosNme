from flask import Flask, request, jsonify
from sklearn.decomposition import NMF
from pymongo import MongoClient
from dotenv import load_dotenv
import pandas as pd
import certifi


# Perform collaborative filtering using Non-Negative Matrix Factorization (NMF)
def collaborative_filtering(df_reviews):
    try:
        # Create a pivot table with users as rows and items as columns
        pivot_table = df_reviews.pivot(index='reviewer', columns='revieweye', values='rating').fillna(0)

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
        for user_id in df_reviews['reviewer'].unique():
            user_index = pivot_table.index.get_loc(user_id)
            user_ratings = predicted_ratings[user_index]
            top_items_indices = user_ratings.argsort()[::-1][:5]  # Get top 5 recommended items
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

@app.route('/recommendations', methods=['POST'])
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
                    displayRecs.append(df_clubs['displayName'][i])

        for i in range(len(df_users['_id'])):
            if str(df_users['_id'][i]) == str(user_id):
                username = df_users['username'][i]

        return jsonify({"recs": displayRecs, "username": username})
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run()