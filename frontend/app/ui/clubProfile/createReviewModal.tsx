import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';

interface CreateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: { rating: number; reviewText: string }) => void;
}

const CreateReviewModal: React.FC<CreateReviewModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const toast = useToast();

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    onSubmit({ rating, reviewText });
    setRating(0);
    setReviewText('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Write a Review</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isRequired mb={4}>
            <FormLabel>Rating</FormLabel>
            <HStack spacing={2}>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  color={star <= rating ? "yellow.400" : "gray.300"}
                  cursor="pointer"
                  onClick={() => setRating(star)}
                  boxSize={6}
                />
              ))}
            </HStack>
          </FormControl>
          <FormControl>
            <FormLabel>Comment</FormLabel>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience..."
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
            Submit Review
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateReviewModal;