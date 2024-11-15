import React, { useState } from "react";
import { MapPin, Star } from "lucide-react";
import Link from "next/link";
import { getDefaultClubImage } from "../lib/imageSelector";
import { features } from "process";

interface BarCardProps {
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
}

const BarCard: React.FC<BarCardProps> = ({
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
  dressCode
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={`/club/${username}`}
      className="relative block group bg-white/5 rounded-3xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
        style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : `url('/default-images/${
          getDefaultClubImage({
            genres: genres,
            features: features,
            formattedPrice: formattedPrice,
            capacity: capacity,
            dressCode: dressCode,
            description: description
          })
        }.jpg')` }}
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
      <div className="relative h-80">
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="space-y-2">
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
            <div className="flex items-center justify-between pt-4">
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

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="w-full py-3 bg-white text-purple-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-center">
            View Details
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BarCard;