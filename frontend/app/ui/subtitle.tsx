import { Text } from "@chakra-ui/react";
import { ReactNode } from "react";

export default function Subtitle({children}:Readonly<{children:ReactNode}>) {
    return(
        <Text
            fontSize="12"
            fontWeight="bold"
            color={'gray.400'}
            mb={2}
            _after={{
                content: '" "',
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: '-0.25rem',
                borderBottom: '1px solid #ffffff',
                transform: 'scaleX(0)',
                transition: 'transform 0.3s ease'
            }}
            >
                {children}
            </Text>
    );
}