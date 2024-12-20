import React, { useState, useEffect } from "react";
import { MapPin, Star } from "lucide-react";
import Link from "next/link";
import { getDefaultClubImage } from "../lib/imageSelector";
import AvailabilityDisplay from "./availabilityDisplay";
import { getRangeAvailability } from "../lib/backendAPI";
import { useRouter } from "next/navigation";
import { useReservation } from "./reservationContext";

interface AvailabilityDay {
  date: string;
  totalTables: number;
  reservedTables: number;
  availableTables: number;
  hasAvailability: boolean;
}

interface OpeningHours {
  [key: string]: {
    isOpen: boolean;
    open: string;
    close: string;
  };
}

interface BarCardProps {
  _id: string; //Added for availability fetch
  imageUrl: string;
  imageAlt: string;
  title: string;
  description: string;
  formattedPrice: number;
  reviewCount: number;
  rating: number;
  location: string;
  genres?: string[];
  username: string;
  features: string[];
  capacity: number;
  dressCode: string;
  selectedDate?: string;
  onDateSelect?: (date: Date) => void;
  openingHours: OpeningHours;
}

const BarCard: React.FC<BarCardProps> = ({
  _id,
  imageUrl,
  imageAlt,
  title,
  description,
  formattedPrice,
  reviewCount,
  rating,
  location,
  genres,
  username,
  features,
  capacity,
  dressCode,
  selectedDate,
  openingHours
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityDay[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const { setSelectedDate } = useReservation();
  const router = useRouter();

  const onDateSelect = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setSelectedDate(formattedDate);
    router.push(`/club/${username}/reservation`);
  }

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!_id) return;
      setIsLoadingAvailability(true);
      try {
        const start = selectedDate 
          ? new Date(new Date(selectedDate).setDate(new Date(selectedDate).getDate() - 2))
          : new Date();
        const end = new Date(start);
        end.setDate(end.getDate() + 30);
        
        //console.log("Printing start and end dates: ", start, end);

        const availabilityData = await getRangeAvailability(
          _id,
          start.toISOString().split('T')[0],
          end.toISOString().split('T')[0]
        );

        //console.log("Printing availability fetched: ", availabilityData.availability);

        setAvailability(availabilityData.availability);
      } catch (err) {
        console.error('Error fetching availability:', err);
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [_id, selectedDate, capacity]);

  const handleDateSelect = (date: Date) => {
    onDateSelect?.(date);
  };

  return (
    <div 
      className="relative block group bg-white/5 rounded-3xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
    <Link
      href={`/club/${username}`}
      className="block"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-110" 
        style={{ 
          backgroundImage: imageUrl ? `url(${imageUrl})` : `url('/default-images/${
            getDefaultClubImage({
              genres,
              features,
              formattedPrice,
              capacity,
              dressCode,
              description
            })
          }.jpg')`
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
      
      {/* Price Tag */}
      <div className="absolute top-4 right-4 z-10">
        <div className="px-3 py-1 bg-purple-600 rounded-full text-sm font-semibold text-white shadow-lg">
          ${formattedPrice}+
        </div>
      </div>
      
      {/* Content Container */}
      <div className="relative h-[28rem]">
        <div className="absolute inset-x-0 bottom-0 p-6">
          <div className="space-y-4">
            {/* Tags */}
            <div className="flex items-center space-x-2">
              {genres?.[0] && (
                <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white">
                  {genres[0]}
                </span>
              )}
              <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">
                Open Now
              </span>
            </div>
            
            {/* Title and Description */}
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-gray-300 text-sm line-clamp-2">{description}</p>
            
            {/* Rating and Location */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
                <span className="text-gray-300 text-sm ml-2">
                  ({reviewCount})
                </span>
              </div>
              
              <div className="flex items-center text-gray-300">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{location || 'Location unavailable'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
      {/* Hover Overlay with Availability */}
      <div 
      className={`absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/60 transition-opacity duration-300 
        ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="absolute inset-x-0 bottom-0 p-6">
          {isLoadingAvailability ? (
            <div className="animate-pulse bg-gray-700/50 rounded-lg h-24" />
          ) : (
            <AvailabilityDisplay
              availableDays={availability}
              selectedDate={selectedDate}
              onDateSelect={onDateSelect}
              openingHours={openingHours}
            />
          )}

          <button className="mt-4 w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarCard;