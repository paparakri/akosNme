from datetime import datetime, timedelta
from typing import Dict, List, Any
from pymongo import UpdateOne
from ClubScorer import ClubScorer

class ClubScoreManager:
    def __init__(self, db):
        self.db = db
        self.scorer = ClubScorer()
        self.SCORE_VALIDITY_DAYS = 1
        # Define minimum score thresholds for each category
        self.score_thresholds = {
            'trending': 25,        # Only show very trending clubs
            'luxury': 40,          # High threshold for luxury venues
            'student_friendly': 40, # Reasonable threshold for student spots
            'big_groups': 35,      # Places that can actually handle groups
            'date_night': 30,      # Good ambiance and setting
            'live_music': 25       # Must have proper music setup
        }

    def update_club_scores(self, club_id: str) -> None:
        """Update scores for a single club"""
        club = self.db.clubusers.find_one({'_id': club_id})
        if not club:
            return
        
        scores = {
            list_type: self.scorer.calculate_fit(club, list_type)
            for list_type in self.scorer.list_types.keys()
        }
        
        self.db.club_scores.update_one(
            {'club_id': club_id},
            {
                '$set': {
                    'scores': scores,
                    'last_updated': datetime.utcnow()
                }
            },
            upsert=True
        )

    def bulk_update_scores(self) -> None:
        """Bulk update scores for all clubs that need updating"""
        cutoff_date = datetime.now() - timedelta(days=self.SCORE_VALIDITY_DAYS)
        
        pipeline = [
            {
                '$lookup': {
                    'from': 'clubusers',
                    'localField': '_id',
                    'foreignField': 'club_id',
                    'as': 'score_data'
                }
            },
            {
                '$match': {
                    '$or': [
                        {'score_data': {'$size': 0}},
                        {'score_data.last_updated': {'$lt': cutoff_date}}
                    ]
                }
            }
        ]
        
        clubs_needing_updates = list(self.db.clubusers.aggregate(pipeline))
        
        operations = []
        for club in clubs_needing_updates:
            scores = {
                list_type: self.scorer.calculate_fit(club, list_type)
                for list_type in self.scorer.list_types.keys()
            }
            
            operations.append(UpdateOne(
                {'club_id': club['_id']},
                {
                    '$set': {
                        'scores': scores,
                        'last_updated': datetime.utcnow()
                    }
                },
                upsert=True
            ))
        
        if operations:
            self.db.club_scores.bulk_write(operations)

    def get_clubs_by_category(self, category: str, page: int = 1, limit: int = 20) -> List[Dict]:
        """Get clubs sorted by their score in a specific category and filtered by minimum threshold"""
        skip = (page - 1) * limit
        
        # Get the minimum score threshold for this category
        min_score = self.score_thresholds.get(category, 0)
        
        # Enhanced pipeline with score threshold filtering
        pipeline = [
            {
                '$lookup': {
                    'from': 'club_scores',
                    'localField': '_id',
                    'foreignField': 'club_id',
                    'as': 'score_data'
                }
            },
            {
                '$unwind': {
                    'path': '$score_data',
                    'preserveNullAndEmptyArrays': True
                }
            },
            {
                '$addFields': {
                    'category_score': {
                        '$ifNull': ['$score_data.scores.' + category, 0]
                    }
                }
            },
            {
                # Only include clubs that meet the minimum score threshold
                '$match': {
                    'category_score': {'$gte': min_score}
                }
            },
            {'$sort': {'category_score': -1}},
            {'$skip': skip},
            {'$limit': limit}
        ]
        
        clubs = list(self.db.clubusers.aggregate(pipeline))
        
        # Include the score in the returned clubs
        for club in clubs:
            club['score'] = club.get('category_score', 0)

        return clubs