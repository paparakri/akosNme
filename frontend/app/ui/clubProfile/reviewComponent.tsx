import React, { useEffect, useState } from 'react';
import {
  Box, VStack, HStack, Text, Avatar, Flex, Progress, Divider,
  Spinner, Button, useToast, Textarea
} from '@chakra-ui/react';
import { StarIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { fetchNormalUser, fetchReviewById, deleteReview } from '@/app/lib/backendAPI';

interface User {
  _id: string;
  username: string;
  avatar?: string;
}

interface Review {
  _id: string;
  user: User;
  club: string;
  rating: number;
  date: string;
  reviewText: string;
}

interface ReviewProps {
  reviews: string[];
  currentUserId: string | null;
  onReviewUpdate: () => void;
}

const ReviewComponent: React.FC<ReviewProps> = ({ reviews, currentUserId, onReviewUpdate }) => {
  const [reviewList, setReviewList] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');
  const toast = useToast();

  const getClubIdFromReviewId = async (reviewId:string) => {
    const review = await fetchReviewById(reviewId);
    const clubId = review.club;
    return clubId;
  }

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const fetchedReviews = await Promise.all(
          reviews.map(async (reviewId: string) => {
            const reviewData = await fetchReviewById(reviewId);
            const userData = await fetchNormalUser(reviewData.user);
            return {
              ...reviewData,
              user: {
                _id: userData._id,
                username: userData.username,
                avatar: userData.avatar,
              },
            };
          })
        );
        setReviewList(fetchedReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast({
          title: "Error fetching reviews",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchReviews();
  }, [reviews, toast]);

  const handleEdit = (reviewId: string, currentText: string) => {
    setEditingReview(reviewId);
    setEditedText(currentText);
  };

  const handleSaveEdit = async (reviewId: string) => {
    try {
      //await updateReview(reviewId, { reviewText: editedText });
      setReviewList(prevList =>
        prevList.map(review =>
          review._id === reviewId ? { ...review, reviewText: editedText } : review
        )
      );
      setEditingReview(null);
      onReviewUpdate();
      toast({
        title: "Review updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error updating review:", error);
      toast({
        title: "Error updating review",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (reviewId:string, clubId:string, userId:string) => {
    try {
      await deleteReview(reviewId, userId);
      setReviewList(prevList => prevList.filter(review => review._id !== reviewId));
      onReviewUpdate();
      toast({
        title: "Review deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting review:", error);
      toast({
        title: "Error deleting review",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading) return <Spinner />;
  if (reviewList.length === 0) return <Text>No reviews available.</Text>;

  const averageRating = reviewList.reduce((acc, review) => acc + review.rating, 0) / reviewList.length;
  const ratingCounts = reviewList.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return (
    <VStack spacing={6} align="stretch">
      <Flex justifyContent="space-between" alignItems="center">
        <Box>
          <Text fontSize="3xl" fontWeight="bold">{averageRating.toFixed(1)}</Text>
          <HStack spacing={1}>
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={`average-star-${star}`}
                color={star <= Math.round(averageRating) ? "yellow.400" : "gray.300"}
              />
            ))}
          </HStack>
          <Text color="gray.500">{reviewList.length} reviews</Text>
        </Box>
        <VStack align="stretch" width="60%">
          {[5, 4, 3, 2, 1].map((rating) => (
            <HStack key={`rating-${rating}`} spacing={4}>
              <Text width="10px">{rating}</Text>
              <Progress
                value={(ratingCounts[rating] || 0) / reviewList.length * 100}
                size="sm"
                width="full"
                colorScheme="yellow"
              />
            </HStack>
          ))}
        </VStack>
      </Flex>
      <Divider />
      {reviewList.map((review) => (
        <Box key={review._id}>
          <HStack spacing={4} mb={2}>
            <Avatar name={review.user.username} src={review.user.avatar} />
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold">{review.user.username}</Text>
              <HStack spacing={1}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={`review-${review._id}-star-${star}`}
                    color={star <= review.rating ? "yellow.400" : "gray.300"}
                    w={4}
                    h={4}
                  />
                ))}
              </HStack>
            </VStack>
            <Text color="gray.500" ml="auto">{new Date(review.date).toLocaleDateString()}</Text>
            {currentUserId === review.user._id && (
              <HStack>
                <Button
                  size="sm"
                  leftIcon={<EditIcon />}
                  onClick={() => handleEdit(review._id, review.reviewText)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  leftIcon={<DeleteIcon />}
                  colorScheme="red"
                  onClick={async () => handleDelete(review._id, await getClubIdFromReviewId(review._id), currentUserId)}
                >
                  Delete
                </Button>
              </HStack>
            )}
          </HStack>
          {editingReview === review._id ? (
            <VStack align="stretch">
              <Textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={4}
              />
              <HStack>
                <Button onClick={() => handleSaveEdit(review._id)}>Save</Button>
                <Button onClick={() => setEditingReview(null)}>Cancel</Button>
              </HStack>
            </VStack>
          ) : (
            <Text>{review.reviewText}</Text>
          )}
          <Divider mt={4} />
        </Box>
      ))}
    </VStack>
  );
};

export default ReviewComponent;