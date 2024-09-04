import { Container, Text, Heading, Stack, extendTheme, useBreakpointValue, Button, Box } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

const customBreak = {
    sm: "30em",
    md: "48em",
    lg: "62em",
    xl: "80em",
  };

export default function CallToActionWithIllustration() {
    extendTheme({breakpoints: customBreak});
    const columns = useBreakpointValue({base:1, sm:2, md:3, lg:4});
    const router = useRouter();
    return (
      <>
        {/* Content inside Container */}
        <Container maxW={"5xl"}>
          <Stack
            textAlign={"center"}
            align={"center"}
            spacing={{ base: 8, md: 10 }}
            pt={{ base: 14, md: 20 }}
          >
            <Heading
              fontWeight={600}
              fontSize={{ base: "3xl", sm: "4xl", md: "6xl" }}
              lineHeight={"110%"}
            >
              Reserving tables{" "}
              <Text as={"span"} color={"orange.400"}>
                made easy
              </Text>
            </Heading>
            <Text color={"gray.500"} maxW={"3xl"}>
              Κουράστηκες να ψάχνεις κονέ κάθε φορά που θες να πας club; Δεν θα ξαναχρειαστείς ποτέ!
            </Text>
            <Stack spacing={6} direction={"row"}>
              <Button
                rounded={"full"}
                px={6}
                colorScheme={"orange"}
                bg={"orange.400"}
                _hover={{ bg: "orange.500" }}
                onClick={() => router.push('/sign-up')}
              >
                Get started
              </Button>
              <Button rounded={"full"} px={6}>
                Learn more
              </Button>
            </Stack>
          </Stack>
        </Container>
        <Container maxW={"5xl"}>
        </Container>
        
  
      </>
    )
  }