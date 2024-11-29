// controllers/search.js
const ClubUser = require('../models/clubUser');
const Reservation = require('../models/reservation');

const formatDateForComparison = (date) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
};

const getDayOfWeek = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date(date).getDay()];
};

const SCORE_THRESHOLDS = {
    trending: 25,
    luxury: 40,
    student_friendly: 40,
    big_groups: 30,
    date_night: 30,
    live_music: 25
};

const FILTER_TO_SCORE_FIELD = {
    trending: 'trending',
    student: 'student_friendly',
    groups: 'big_groups',
    date: 'date_night',
    live: 'live_music',
    luxury: 'luxury'
};

const searchClubs = async (req, res) => {
    try {
        const {
            searchQuery = "",
            location = "",
            date,
            genre = "",
            minPrice,
            radius = 1000,
            page = 1,
            limit = 10,
            features = [],
            minAge = "",
            filter = "all",
            sort = "rating"
        } = req.query;

        const debugClub = await ClubUser.findOne({ 
            displayName: "Elite Social Club" 
          });
          console.log("Elite Social Club details:", {
            openingHours: debugClub?.openingHours,
            capacity: debugClub?.capacity,
            _id: debugClub?._id
          });
          
          // Then check for any reservations
          if (debugClub) {
            const reservations = await Reservation.find({
              club: debugClub._id,
              date: "23-11-2024"
            });
            console.log("Elite Social Club reservations:", reservations);
          }

        console.log('Search parameters:', {
            searchQuery, location, date, filter, page, limit, sort,
            additionalFilters: { minPrice, features, minAge }
        });

        let pipeline = [];

        // Text search
        if (searchQuery) {
            pipeline.push({
                $search: {
                    index: "club_users",
                    text: {
                        query: searchQuery,
                        path: ["displayName", "description"],
                        fuzzy: { maxEdits: 1 }
                    }
                }
            });
        }

        // Handle location search
        if (location) {
            try {
                let coordinates;
                
                if (location.includes(',')) {
                    const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()));
                    if (!isNaN(lat) && !isNaN(lng)) {
                        coordinates = [lng, lat];
                    }
                } else {
                    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
                    const geocodeResponse = await fetch(geocodeUrl, {
                        headers: { 'User-Agent': 'YourApp/1.0' }
                    });
                    const geocodeData = await geocodeResponse.json();

                    if (geocodeData && geocodeData[0]) {
                        coordinates = [
                            parseFloat(geocodeData[0].lon),
                            parseFloat(geocodeData[0].lat)
                        ];
                    }
                }

                if (coordinates) {
                    pipeline.push({
                        $geoNear: {
                            near: { type: "Point", coordinates },
                            distanceField: "distance",
                            maxDistance: parseInt(radius),
                            spherical: true,
                            distanceMultiplier: 0.001
                        }
                    });
                }
            } catch (err) {
                console.error('Location processing error:', err);
            }
        }

        //Handle availability check if date is provided
        if (date) {
            const searchDate = new Date(date);
            const dateString = formatDateForComparison(searchDate);
            const dayOfWeek = getDayOfWeek(searchDate);
          
            pipeline.push({
              $match: {
                $and: [
                  { openingHours: { $exists: true } },
                  { [`openingHours.${dayOfWeek}.isOpen`]: true }
                ]
              }
            });
          
            pipeline.push({
              $lookup: {
                from: 'reservations',
                let: { clubId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$club', '$$clubId'] },
                          { $eq: ['$date', dateString] },
                          { $eq: ['$status', 'approved'] }
                        ]
                      }
                    }
                  },
                  {
                    $group: {
                      _id: null,
                      totalGuests: { $sum: '$numOfGuests' }
                    }
                  }
                ],
                as: 'dateReservations'
              }
            });
          
            pipeline.push({
              $addFields: {
                reservationInfo: { $arrayElemAt: ['$dateReservations', 0] },
                totalReserved: { 
                  $ifNull: [
                    { $arrayElemAt: ['$dateReservations.totalGuests', 0] },
                    0
                  ]
                }
              }
            });
          
            // Remove clubs that exceed capacity
            pipeline.push({
              $match: {
                $expr: {
                  $lte: ['$totalReserved', '$capacity']
                }
              }
            });
          }

        // Category filter using stored scores
        if (filter !== "all" && FILTER_TO_SCORE_FIELD[filter]) {
            console.log('Applying category filter:', {
                filter,
                scoreField: FILTER_TO_SCORE_FIELD[filter],
                threshold: SCORE_THRESHOLDS[FILTER_TO_SCORE_FIELD[filter]]
            });

            // First get count before score filtering
            const initialCount = await ClubUser.countDocuments();
            console.log('Initial clubs count:', initialCount);

            pipeline.push({
                $lookup: {
                    from: 'club_scores',
                    localField: '_id',
                    foreignField: 'club_id',
                    as: 'score_data'
                }
            });

            // Check results after lookup
            const afterLookup = await ClubUser.aggregate([...pipeline]);
            console.log('After score lookup - count:', afterLookup.length);
            if (afterLookup.length > 0) {
                console.log('Sample score_data:', afterLookup[0]?.score_data);
            }

            pipeline.push({
                $unwind: {
                    path: '$score_data',
                    preserveNullAndEmptyArrays: false // Change to true if you want to keep clubs without scores
                }
            });

            const scoreField = FILTER_TO_SCORE_FIELD[filter];
            pipeline.push({
                $addFields: {
                    categoryScore: {
                        $ifNull: [`$score_data.scores.${scoreField}`, 0]
                    }
                }
            });

            const minScore = SCORE_THRESHOLDS[scoreField] || 0;
            pipeline.push({
                $match: {
                    categoryScore: { $gte: minScore }
                }
            });

            // Log intermediate results
            const afterScoring = await ClubUser.aggregate([...pipeline]);
            console.log('After score filtering:', {
                count: afterScoring.length,
                sampleScores: afterScoring.slice(0, 3).map(club => ({
                    name: club.displayName,
                    score: club.categoryScore
                }))
            });

            // Sort by category score
            pipeline.push({
                $sort: {
                    categoryScore: -1,
                    rating: -1
                }
            });
        }

        // Additional filters
        const matchStage = {};

        if (genre) matchStage.genres = genre;
        if (minPrice) matchStage.formattedPrice = { $lte: parseInt(minPrice) };
        if (minAge) {
            const userAge = parseInt(minAge);
            if (!isNaN(userAge) && userAge > 0) {
                matchStage.minAge = { $lte: userAge };
            }
        }

        // Handle features array
        if (features) {
            const featureArray = Array.isArray(features) 
                ? features 
                : typeof features === 'string'
                    ? features.split(',')
                    : [];

            if (featureArray.length > 0) {
                matchStage.features = { $all: featureArray };
            }
        }

        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
            console.log('Additional filters:', matchStage);
        }

        // Default sorting if no category filter
        if (filter === "all") {
            const sortStage = {};
            switch (sort) {
                case "rating": sortStage.rating = -1; break;
                case "price_low": sortStage.formattedPrice = 1; break;
                case "price_high": sortStage.formattedPrice = -1; break;
                case "popularity": sortStage.followers = -1; break;
            }
            if (Object.keys(sortStage).length > 0) {
                pipeline.push({ $sort: sortStage });
            }
        }

        // Get total count for pagination
        const countPipeline = [...pipeline];
        const totalResults = await ClubUser.aggregate([...countPipeline, { $count: 'total' }]);
        const total = totalResults.length > 0 ? totalResults[0].total : 0;

        // Add pagination
        pipeline.push(
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) }
        );

        // Add final projection
        pipeline.push({
            $project: {
                _id: 1,
                username: 1,
                displayName: 1,
                description: 1,
                location: 1,
                formattedPrice: 1,
                rating: 1,
                reviews: 1,
                genres: 1,
                features: 1,
                images: 1,
                distance: 1,
                address: 1,
                openingHours: 1,
                minAge: 1,
                categoryScore: 1,
                score: searchQuery ? { $meta: "searchScore" } : null
            }
        });

        //console.log('Final pipeline:', JSON.stringify(pipeline, null, 2));
        const results = await ClubUser.aggregate(pipeline);
        console.log('Final results:', {
            count: results.length,
            firstResult: results[0] ? {
                name: results[0].displayName,
                score: results[0].categoryScore
            } : null
        });

        res.status(200).json({
            results,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed', details: error.message });
    }
};

const getSearchSuggestions = async (req, res) => {
    try {
        const { query = "" } = req.query;

        if (!query || query.length < 2) {
            return res.status(200).json([]);
        }

        const pipeline = [
            {
                $search: {
                    index: "club_users",
                    autocomplete: {
                        path: "displayName",
                        query: query
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    displayName: 1,
                    location: 1,
                    score: { $meta: "searchScore" }
                }
            },
            { $limit: 5 }
        ];
        
        const suggestions = await ClubUser.aggregate(pipeline);
        res.status(200).json(suggestions);

    } catch (error) {
        console.error('Suggestion error:', error);
        res.status(500).json({ error: 'Failed to get suggestions', details: error.message });
    }
};

// Helper function to verify data exists
const verifyData = async () => {
    try {
        const count = await ClubUser.countDocuments();
        const sampleDoc = await ClubUser.findOne();
        return count;
    } catch (error) {
        console.error('Data verification error:', error);
        return 0;
    }
};

module.exports = { searchClubs, getSearchSuggestions, verifyData };