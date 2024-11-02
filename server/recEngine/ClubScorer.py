from datetime import datetime, timedelta
from typing import Dict, List, Any, Union
from bson import ObjectId

class ClubScorer:
    def __init__(self):
        self.list_types = {
            'trending': self.get_trending_score,
            'luxury': self.get_luxury_score,
            'student_friendly': self.get_student_friendly_score,
            'big_groups': self.get_big_groups_score,
            'date_night': self.get_date_night_score,
            'live_music': self.get_live_music_score
        }

    def calculate_fit(self, club: Dict[str, Any], list_type: str) -> int:
        """Calculate how well a club fits into a specific list."""
        if club is None:
            return 0
            
        if list_type not in self.list_types:
            raise ValueError(f"Unknown list type: {list_type}")

        # Convert MongoDB document to dictionary if necessary
        if hasattr(club, '_data'):
            club = dict(club)

        score = self.list_types[list_type](club)
        return min(round(score), 100)

    def safe_get(self, obj: Dict[str, Any], key: str, default: Any = None) -> Any:
        """Safely get a value from a dictionary, handling ObjectId and missing keys."""
        try:
            value = obj.get(key, default)
            if isinstance(value, ObjectId):
                return str(value)
            return value
        except (AttributeError, TypeError):
            return default

    def get_trending_score(self, club: Dict[str, Any]) -> float:
        now = datetime.now()
        one_week_ago = now - timedelta(days=7)

        # Safely get events
        events = self.safe_get(club, 'events', [])
        if not isinstance(events, list):
            events = []

        # Count recent events with safe date access
        recent_events = 0
        for event in events:
            try:
                event_date = self.safe_get(event, 'date')
                if event_date and isinstance(event_date, str):
                    if datetime.fromisoformat(event_date) >= one_week_ago:
                        recent_events += 1
            except (ValueError, TypeError):
                continue

        score = 0

        # Rating contribution (max 30 points)
        rating = float(self.safe_get(club, 'rating', 0))
        score += (rating / 5) * 30

        # Recent events contribution (max 30 points)
        score += min(recent_events * 10, 30)

        # Followers contribution (max 20 points)
        followers = self.safe_get(club, 'followers', [])
        if not isinstance(followers, list):
            followers = []
        score += min((len(followers) / 100) * 20, 20)

        # Recent reviews contribution (max 20 points)
        reviews = self.safe_get(club, 'reviews', [])
        if not isinstance(reviews, list):
            reviews = []
            
        recent_reviews = 0
        for review in reviews:
            try:
                review_date = self.safe_get(review, 'date')
                if review_date and isinstance(review_date, str):
                    if datetime.fromisoformat(review_date) >= one_week_ago:
                        recent_reviews += 1
            except (ValueError, TypeError):
                continue

        score += min(recent_reviews * 5, 20)

        return score

    def get_luxury_score(self, club: Dict[str, Any]) -> float:
        score = 0

        # Price contribution (max 30 points)
        price = int(self.safe_get(club, 'formatted_price', 1))
        price_scores = {
            4: 30,
            3: 20
        }
        score += price_scores.get(price, 10)

        # Dress code contribution (max 25 points)
        dress_code = self.safe_get(club, 'dress_code', 'Casual')
        dress_codes = {
            'Formal': 25,
            'Smart': 20,
            'Smart Casual': 15,
            'Casual': 5
        }
        score += dress_codes.get(dress_code, 0)

        # Rating contribution (max 25 points)
        rating = float(self.safe_get(club, 'rating', 0))
        score += (rating / 5) * 25

        # Features contribution (max 20 points)
        features = self.safe_get(club, 'features', [])
        if not isinstance(features, list):
            features = []
            
        luxury_features = {
            'VIP Tables', 'Bottle Service',
            'Valet Parking', 'Private Events'
        }
        score += sum(5 for feature in features if feature in luxury_features)

        return score

    def get_student_friendly_score(self, club: Dict[str, Any]) -> float:
        score = 0

        # Price contribution (max 35 points)
        price = int(self.safe_get(club, 'formatted_price', 4))
        if price <= 2:
            score += 35
        elif price <= 3:
            score += 25
        else:
            score += 10

        # Age requirement contribution (max 25 points)
        min_age = int(self.safe_get(club, 'min_age', 21))
        if min_age <= 18:
            score += 25
        elif min_age <= 21:
            score += 20
        else:
            score += 10

        # Genre contribution (max 20 points)
        genres = self.safe_get(club, 'genres', [])
        if not isinstance(genres, list):
            genres = []
            
        student_friendly_genres = {'Pop', 'Hip-Hop', 'EDM', 'House'}
        genre_matches = len(student_friendly_genres.intersection(set(genres)))
        score += (genre_matches / len(student_friendly_genres)) * 20

        # Features contribution (max 20 points)
        features = self.safe_get(club, 'features', [])
        if not isinstance(features, list):
            features = []
            
        student_features = {
            'Student Discount', 'Happy Hour',
            'Dance Floor', 'Games'
        }
        score += sum(5 for feature in features if feature in student_features)

        return score

    def get_big_groups_score(self, club: Dict[str, Any]) -> float:
        score = 0

        # Capacity contribution (max 30 points)
        capacity = int(self.safe_get(club, 'capacity', 0))
        if capacity >= 300:
            score += 30
        elif capacity >= 200:
            score += 25
        elif capacity >= 100:
            score += 15
        else:
            score += 5

        # Table layout contribution (max 30 points)
        table_layout = self.safe_get(club, 'table_layout', [])
        if not isinstance(table_layout, list):
            table_layout = []
            
        large_tables = sum(1 for table in table_layout 
                          if isinstance(table, dict) and 
                          self.safe_get(table, 'capacity', 0) >= 6)
        score += min(large_tables * 5, 30)

        # Features contribution (max 40 points)
        features = self.safe_get(club, 'features', [])
        if not isinstance(features, list):
            features = []
            
        group_features = {
            'Group Packages', 'Private Areas',
            'Group Discounts', 'Birthday Specials'
        }
        score += sum(10 for feature in features if feature in group_features)

        return score

    def get_date_night_score(self, club: Dict[str, Any]) -> float:
        score = 0

        # Features contribution (max 40 points)
        features = self.safe_get(club, 'features', [])
        if not isinstance(features, list):
            features = []
            
        date_features = {
            'Intimate Seating', 'Mood Lighting',
            'Cocktail Menu', 'Quiet Areas'
        }
        score += sum(10 for feature in features if feature in date_features)

        # Genre contribution (max 30 points)
        genres = self.safe_get(club, 'genres', [])
        if not isinstance(genres, list):
            genres = []
            
        date_night_genres = {'Jazz', 'Lounge', 'R&B'}
        genre_matches = len(date_night_genres.intersection(set(genres)))
        score += (genre_matches / len(date_night_genres)) * 30

        # Rating contribution (max 30 points)
        rating = float(self.safe_get(club, 'rating', 0))
        score += (rating / 5) * 30

        return score

    def get_live_music_score(self, club: Dict[str, Any]) -> float:
        score = 0

        # Features contribution (max 50 points)
        features = self.safe_get(club, 'features', [])
        if not isinstance(features, list):
            features = []
            
        music_features = {
            'Live Band', 'Stage', 'Sound System',
            'Dance Floor', 'Music Events'
        }
        score += sum(10 for feature in features if feature in music_features)

        # Events contribution (max 30 points)
        events = self.safe_get(club, 'events', [])
        if not isinstance(events, list):
            events = []
            
        music_events = sum(1 for event in events 
                          if isinstance(event, dict) and 
                          self.safe_get(event, 'type') == 'Live Music')
        score += min(music_events * 5, 30)

        # Rating contribution (max 20 points)
        rating = float(self.safe_get(club, 'rating', 0))
        score += (rating / 5) * 20

        return score


# Example usage

#if __name__ == "__main__":
#    scorer = ClubScorer()
#
#    example_club = {
#       'rating': 4.5,
#      'formatted_price': 3,
#     'capacity': 200,
#    'min_age': 21,
#        'dress_code': 'Smart Casual',
#        'features': ['VIP Tables', 'Dance Floor', 'Bottle Service'],
#        'followers': [None] * 150,  # 150 followers
#        'reviews': [{'date': datetime.now().isoformat()}] * 50,  # 50 reviews
#        'events': [
#            {'date': datetime.now().isoformat(), 'type': 'Live Music'},
#            {'date': datetime.now().isoformat(), 'type': 'Regular'}
#        ],
#        'genres': ['House', 'Techno'],
#        'table_layout': [
#            {'capacity': 4},
#            {'capacity': 6},
#            {'capacity': 8}
#        ]
#    }
#
   # Get fits for different lists
#    list_types = ['trending', 'luxury', 'student_friendly', 'big_groups']
#    for list_type in list_types:
#        fit = scorer.calculate_fit(example_club, list_type)
#        print(f"{list_type} list fit: {fit}%")