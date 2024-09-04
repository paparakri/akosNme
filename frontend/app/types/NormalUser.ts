import { Club } from "./Club";
import { ReviewReference } from "./Review";
import { ServiceProvider } from "./ServiceProvider";

export type NormalUser = {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    picturePath: string;
    refreshToken: string;
    serviceProviderInterests: ServiceProvider[];
    clubInterests: Club[];
    yourReviews: ReviewReference[];
    createdAt: string;
    updatedAt: string;
  };