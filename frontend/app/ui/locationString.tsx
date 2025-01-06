import { Text } from "@chakra-ui/react"
import { reverseGeocode } from "../lib/backendAPI"

interface Location {
    type: String,
    coordinates: [number | null, number | null]
}

export const LocationString = ({ location }: { location: Location }) => {
    // TODO: Convert coordinates to a readable string
    const locationString = reverseGeocode({
        lat: location.coordinates[0],
        lng: location.coordinates[1]
    });
    return (
        <Text>
            {locationString}
        </Text>
    )
}