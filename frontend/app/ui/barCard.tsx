import React from "react";
import {  Box, Flex, Badge, Text } from '@chakra-ui/react';
import { BsStar, BsStarFill, BsStarHalf } from 'react-icons/bs';
import { StarIcon } from "@chakra-ui/icons";
import { Image as ChakraImage } from "@chakra-ui/react";

interface BarCardProps {
  imageUrl: string,
  imageAlt: string,
  title: string,
  description: string,
  formattedPrice: number,
  reviewCount: number,
  rating: number,
  location: string
};

interface RatingProps {
  rating: number
  numReviews: number
}

function Rating({ rating, numReviews }: RatingProps) {
  return (
    <Box display="flex" alignItems="center">
      {Array(5)
        .fill('')
        .map((_, i) => {
          const roundedRating = Math.round(rating * 2) / 2
          if (roundedRating - i >= 1) {
            return (
              <BsStarFill
                key={i}
                style={{ marginLeft: '1' }}
                color={i < rating ? 'orange.500' : 'gray.300'}
              />
            )
          }
          if (roundedRating - i === 0.5) {
            return <BsStarHalf key={i} style={{ marginLeft: '1' }} />
          }
          return <BsStar key={i} style={{ marginLeft: '1' }} />
        })}
      <Box as="span" ml="2" color="gray.600" fontSize="sm">
        ({numReviews})
      </Box>
    </Box>
  )
}

const BarCard: React.FC<BarCardProps> = ({imageUrl, imageAlt, title, description, formattedPrice, reviewCount, rating, location}) => {

  return (
        <Box
          bg="white"
          _dark={{
            bg: "gray.800",
          }}
          maxW="sm"
          borderWidth="1px"
          rounded="lg"
          shadow="lg"
          marginRight={3}
          marginLeft={3}
          marginBottom={5}
          marginTop={5}
          boxShadow={'2xl'}
        >
          <ChakraImage
            src={imageUrl}
            alt={imageAlt}
            roundedTop="inherit"
          />
  
          <Box p="6">
            <Box display="flex" alignItems="baseline">
              <Badge rounded="full" px="2" colorScheme="orange">
                New
              </Badge>
              <Box
                color="gray.500"
                fontWeight="semibold"
                letterSpacing="wide"
                fontSize="xs"
                textTransform="uppercase"
                ml="2"
              >
                {location}
              </Box>
            </Box>
  
            <Text
              mt="1"
              fontWeight="semibold"
              as="h4"
              lineHeight="tight"
              noOfLines={1}
            >
              {title}
            </Text>
            <Text 
              mt="1"
              fontStyle={"italic"}
              lineHeight="tight"
              noOfLines={2}>
              {description}
            </Text>
            <Box>
              ${formattedPrice}
              <Box as="span" color="gray.600" fontSize="sm">
                (min)
              </Box>
            </Box>
  
            <Box display="flex" mt="2" alignItems="center">
              {Array(5)
                .fill("")
                .map((_, i) => (
                  <StarIcon
                    key={i}
                    color={i < rating ? "orange.500" : "gray.300"}
                  />
                ))}
              <Box as="span" ml="2" color="gray.600" fontSize="sm">
                ({reviewCount})
              </Box>
            </Box>
          </Box>
        </Box>
    );
  };
    

export default BarCard;