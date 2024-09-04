import { Heading, Text } from "@chakra-ui/react";
import { ReactNode } from "react";

export default function CustomHeading({children}: Readonly<{children: ReactNode}>){
    return (
        <Heading fontWeight={400}
            fontSize={{ base: "2xl", sm: "3xl", md: "5xl" }}
            lineHeight={"110%"}>
            {children}
        </Heading>
    );
}