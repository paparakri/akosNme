'use client'
import {
  Container,
  Heading,
  Stack,
  Text,
  SimpleGrid,
  Box,
  Button,
  useBreakpointValue,
  extendTheme,
  Flex
} from '@chakra-ui/react'
import LargeWithAppLinksAndSocial from './footer.tsx'
import WithSubnavigation from './navbar.tsx'
import BarCard from './components/barCard.tsx'
import demoPic from './assets/demoPic.jpg'

const customBreak = {
  sm: "30em",
  md: "48em",
  lg: "62em",
  xl: "80em",
};

export default function CallToActionWithIllustration() {
  extendTheme({breakpoints: customBreak});
  const columns = useBreakpointValue({base:1, sm:2, md:3, lg:4});
  return (
    <>
      {/* Content inside Container */}
      <Container maxW={"5xl"}>
        <WithSubnavigation />
        <Stack
          textAlign={"center"}
          align={"center"}
          spacing={{ base: 8, md: 10 }}
          py={{ base: 14, md: 20 }}
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
            >
              Get started
            </Button>
            <Button rounded={"full"} px={6}>
              Learn more
            </Button>
          </Stack>
        </Stack>
      </Container>

      {/* SimpleGrid taking up the whole screen */}
      <Box bg="#edf3f8" _dark={{ bg: "#3e3e3e" }} width="95%" mx="auto" borderRadius={30}>
      <Box width="80%" mx="auto" textAlign="center">
        <SimpleGrid columns={columns} spacing={0}>
          <BarCard
            imageAlt="Rock N Roll Club"
            imageUrl={demoPic}
            title="Rock & Roll"
            description="Rock N Roll club in Kolonaki Athens"
            formattedPrice={400}
            reviewCount={46}
            rating={4}
            location="Athens"
          />
          <BarCard
            imageAlt="Rock N Roll Club"
            imageUrl={demoPic}
            title="Rock & Roll"
            description="Rock N Roll club in Kolonaki Athens"
            formattedPrice={400}
            reviewCount={46}
            rating={4}
            location="Athens"
          />
          <BarCard
            imageAlt="Rock N Roll Club"
            imageUrl={demoPic}
            title="Rock & Roll"
            description="Rock N Roll club in Kolonaki Athens"
            formattedPrice={400}
            reviewCount={46}
            rating={4}
            location="Athens"
          />
          <BarCard
            imageAlt="Rock N Roll Club"
            imageUrl={demoPic}
            title="Rock & Roll"
            description="Rock N Roll club in Kolonaki Athens"
            formattedPrice={400}
            reviewCount={46}
            rating={4}
            location="Athens"
          />
        </SimpleGrid>
        <Button bg="#d3dae0" margin={3}>
          Show More
        </Button>
      </Box>
      </Box>

      <Container maxW={"5xl"}>
      <LargeWithAppLinksAndSocial />
      </Container>
      

    </>
  )
}
