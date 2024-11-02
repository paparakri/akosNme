from datetime import datetime, timedelta
from typing import Dict, List, Any
from pymongo import UpdateOne
from ClubScorer import ClubScorer

class ClubScoreManager:
    def __init__(self, db):
        self.db = db
        self.scorer = ClubScorer()
        self.SCORE_VALIDITY_DAYS = 1  # How long scores are considered valid

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
        
        print(f"Updating scores for clubs last updated before {cutoff_date}")
        
        # Get all clubs from clubUser collection and their current scores (if any)
        pipeline = [
            {
                # Start with all clubs in clubUser
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
                        # Either no scores exist
                        {'score_data': {'$size': 0}},
                        # Or scores are outdated
                        {'score_data.last_updated': {'$lt': cutoff_date}}
                    ]
                }
            }
        ]
        
        clubs_needing_updates = list(self.db.clubusers.aggregate(pipeline))
        
        print(f"Found {len(clubs_needing_updates)} clubs needing updates")
        print(clubs_needing_updates)

        # Prepare bulk updates
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
        
        print(f"Updating scores for {len(operations)} clubs")
        if operations:
            self.db.club_scores.bulk_write(operations)

    def get_clubs_by_category(self, category: str, page: int = 1, limit: int = 20) -> List[Dict]:
        """Get clubs sorted by their score in a specific category"""
        skip = (page - 1) * limit
        
        # Pipeline to join clubusers with their scores and sort by category score
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
                    'preserveNullAndEmptyArrays': True  # Keep clubs even if they don't have scores yet
                }
            },
            {
                '$addFields': {
                    'category_score': {
                        '$ifNull': ['$score_data.scores.' + category, 0]  # Default to 0 if no score
                    }
                }
            },
            {'$sort': {'category_score': -1}},
            {'$skip': skip},
            {'$limit': limit}
        ]
        
        clubs = list(self.db.clubusers.aggregate(pipeline))
        
        # Include the score in the returned clubs
        for club in clubs:
            club['score'] = club.get('category_score', 0)  # Add the score to each club

        return clubs
