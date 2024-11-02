const reverseGeocode = async (req, res) => {
    try {
        const location = {
            lat: req.params.lat,
            lng: req.params.lng
        };
        console.log(location);
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?` +
            `lat=${location.lat}` +
            `&lon=${location.lng}` +
            `&format=json` +
            `&addressdetails=1` +
            `&countrycodes=gr`,
            {
                headers: {
                    'Accept-Language': 'el',
                    'User-Agent': 'YourAppName'
                }
            }
        );

        if (!response.ok) {
            throw new Error('Reverse geocoding request failed');
        }

        const data = await response.json();

        if (!data) {
            throw new Error('No address found for these coordinates');
        }

        // Format the address similar to the LocationInput component
        const parts = [];
        const address = data.address;

        if (address) {
            const { road, house_number, suburb, city, state, postcode } = address;
            
            if (road) {
                parts.push(house_number ? `${road} ${house_number}` : road);
            }
            if (suburb) parts.push(suburb);
            if (city) parts.push(city);
            if (state) parts.push(state);
            if (postcode) parts.push(postcode);
        }

        res.status(200).json({
            address: parts.length > 0 ? parts.join(', ') : data.display_name,
        })
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        throw error;
    }
};

const geocode = async (req, res) => {
    try {
        const address = req.params.address;
        console.log(address);
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?` +
            `q=${encodeURIComponent(address)}` +
            `&countrycodes=gr` +
            `&format=json` +
            `&limit=4`,
            {
                headers: {
                    'Accept-Language': 'el',
                    'User-Agent': 'YourAppName'
                }
            }
        );

        //console.log(response);

        if (!response.ok) {
            return res.status(500).json({ error: 'Geocoding request failed' });
        }

        const data = await response.json();

        console.log(data);

        if (!data || data.length === 0) {
            return res.status(400).json({ error: 'No results found for this address' });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Geocoding error:', error);
        throw error;
    }
}

module.exports = { geocode, reverseGeocode }