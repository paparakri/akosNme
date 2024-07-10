import {Spinner} from '@chakra-ui/react';
import {useState, useEffect} from 'react';
import {APIProvider, Map} from "@vis.gl/react-google-maps";

import {Circle} from './circle.tsx';


const useGeolocation = () => {
    const [location, setLocation] = useState({
        loaded: false,
        coordinates: { lat: "", lng: "" }
    });

    const onSuccess = (location) => {
        setLocation({
            loaded: true,
            coordinates: {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
            }
        });
    };

    const onError = (error) => {
        setLocation({
            loaded: true,
            error,
        });
    };

    useEffect(() => {
        if (!("geolocation" in navigator)) {
            onError({
                code: 0,
                message: "Geolocation not supported",
            });
        }

        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }, []);

    return location;
};

function SelectLocation() {
    const location = useGeolocation();
    const center = {lat: parseFloat(location.coordinates.lat), lng: parseFloat(location.coordinates.lng)};

    return (
        <div>
            {location.loaded ? (
                location.error ? (
                    <div>Error: {location.error.message}</div>
                ) : (
                    <div>

                        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API} onLoad={()=>{console.log("Map API has loaded.")}}>
                            <Map
                                draggable={false}
                                style={{width: '100vw', height: '100vh'}}
                                defaultZoom={12}
                                gestureHandling={'greedy'}
                                disableDefaultUI={true}
                                defaultCenter={center}
                                mapId={'DEMO_MAP_ID'}>
                                <Circle center={center} radius={5000}/>
                            </Map>
                        </APIProvider>
                    </div>
                )
            ) : (
                <div><Spinner/></div>
            )}
        </div>
    );
}

export default SelectLocation;