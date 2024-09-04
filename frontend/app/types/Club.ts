import { NormalUser } from "./NormalUser";
import { ReviewReference } from "./Review";
import { ServiceProvider } from "./ServiceProvider";

export type Club = {
    id: string;
    username: string;
    email: string;
    password: string;
    description: string;
    displayName: string;
    location: string;
    rating: number;
    picturePath: string;
    reviews: ReviewReference[];
    events: Event[];
    followers: NormalUser[];
    serviceProviderInterest: ServiceProvider[];
  };
  
  type Event = {
    id: string;
    title: string;
    date: string;
    description: string;
  };