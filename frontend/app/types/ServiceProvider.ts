import { Club } from "./Club";
import { NormalUser } from "./NormalUser";

export type ServiceProvider = {
    id: string;
    username: string;
    email: string;
    password: string;
    displayName: string;
    firstName: string;
    lastName: string;
    picturePath: string;
    bio: string;
    type: string;
    musicType: string;
    interestedClubs: Club[];
    followers: NormalUser[];
    events: string[];
  };
  
  type Event = {
    id: string;
    title: string;
    date: string;
    description: string;
  };