import { Text } from "@chakra-ui/react"
import { reverseGeocode } from "../lib/backendAPI"

interface Location {
    type: String,
    coordinates: [Number, Number]
}

export const LocationString = ({ location }: { location: Location }) => {
    // TODO: Convert coordinates to a readable string
    const locationString = reverseGeocode(location.coordinates[0], location.coordinates[1]);
    return (
        <Text>
            {locationString}
        </Text>
    )
    
}