import { fetchClubInfo, fetchNormalUser } from '../lib/backendAPI';
import { Club } from './Club';
import { NormalUser } from './NormalUser';

export type ReviewReference = {
  id: string;
  rating: number;
  reviewText?: string;
  reviewerId: string;
  revieweeId: string;
  createdAt: string;
  updatedAt: string;
};

export type DetailedReview = {
  id: string;
  rating: number;
  reviewText?: string;
  reviewer: NormalUser;
  reviewee: Club;
  createdAt: string;
  updatedAt: string;
};

// Function to convert a ReviewReference to a DetailedReview
export async function getDetailedReview(review: ReviewReference): Promise<DetailedReview> {
  const reviewer = await fetchNormalUser(review.reviewerId);
  const reviewee = await fetchClubInfo(review.revieweeId);
  
  return {
    ...review,
    reviewer,
    reviewee,
  };
}