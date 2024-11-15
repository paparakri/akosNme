// controllers/search.js
const ClubUser = require('../models/clubUser');

const searchClubs = async (req, res) => {
    try {
        console.log('Received search query:', req.query);
        
        const {
            searchQuery = "",
            location = "",
            date = "",
            genre = "",
            minPrice,
            maxPrice,
            rating,
            radius = 5000, // Default 5km
            page = 1,
            limit = 10
        } = req.query;

        let pipeline = [];

        // Handle location search
        if (location) {
            try {
                let coordinates;
                
                // Check if location is already in lat,lng format
                if (location.includes(',')) {
                    const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()));
                    if (!isNaN(lat) && !isNaN(lng)) {
                        coordinates = [lng, lat]; // MongoDB expects [longitude, latitude]
                    }
                } else {
                    // Geocode the location string
                    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
                    const geocodeResponse = await fetch(geocodeUrl, {
                        headers: {
                            'User-Agent': 'YourApp/1.0'
                        }
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
                            near: {
                                type: "Point",
                                coordinates: coordinates
                            },
                            distanceField: "distance",
                            maxDistance: parseInt(radius),
                            spherical: true,
                            distanceMultiplier: 0.001, // Convert to kilometers
                            key: "location" // Specify the field name that has the 2dsphere index
                        }
                    });
                }
            } catch (err) {
                console.error('Location processing error:', err);
            }
        }

        // Add text search if query exists
        if (searchQuery) {
            pipeline.push({
                $search: {
                    index: "club_users",
                    text: {
                        query: searchQuery,
                        path: ["displayName", "description"],
                        fuzzy: {
                            maxEdits: 1
                        }
                    }
                }
            });
        }

        // If no location or search query, start with a simple match all
        if (pipeline.length === 0) {
            pipeline.push({ $match: {} });
        }

        // Add the projection stage
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
                score: searchQuery ? { $meta: "searchScore" } : null
            }
        });

        // Add filters if provided
        const matchStage = {};

        if (genre) {
            matchStage.genres = genre;
        }

        if (minPrice || maxPrice) {
            matchStage.formattedPrice = {};
            if (minPrice) matchStage.formattedPrice.$gte = parseInt(minPrice);
            if (maxPrice) matchStage.formattedPrice.$lte = parseInt(maxPrice);
        }

        if (rating) {
            matchStage.rating = { $gte: parseFloat(rating) };
        }

        // Add match stage if there are any filters
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        // Sort by distance if it's a location search, otherwise by score if it's a text search
        if (location) {
            pipeline.push({ $sort: { distance: 1 } });
        } else if (searchQuery) {
            pipeline.push({ $sort: { score: -1 } });
        }

        // Add pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: parseInt(limit) });

        console.log('Search pipeline:', JSON.stringify(pipeline, null, 2));

        // Execute search
        const results = await ClubUser.aggregate(pipeline);

        // Get total count (without pagination)
        const countPipeline = pipeline.slice(0, -2);
        countPipeline.push({ $count: "total" });
        const totalCount = await ClubUser.aggregate(countPipeline);
        const total = totalCount.length > 0 ? totalCount[0].total : 0;

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
        console.log('Received suggestion query:', req.query);
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
            {
                $limit: 5
            }
        ];

        console.log('Suggestion pipeline:', JSON.stringify(pipeline, null, 2));
        
        const suggestions = await ClubUser.aggregate(pipeline);
        console.log('Suggestions results:', JSON.stringify(suggestions, null, 2));

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
        console.log(`Total documents in ClubUser collection: ${count}`);
        
        const sampleDoc = await ClubUser.findOne();
        //console.log('Sample document:', JSON.stringify(sampleDoc, null, 2));
        
        return count;
    } catch (error) {
        console.error('Data verification error:', error);
        return 0;
    }
};

module.exports = { searchClubs, getSearchSuggestions, verifyData };