'use client';

import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import SplashScreen from '../splashscreen';
import { fetchClubByName, updateClub, uploadImage } from '@/app/lib/backendAPI';
import { OpeningHoursInfo, OpeningHoursPicker, openingHoursToString } from '../openHoursPicker';
import { X as CloseIcon, Image as ImageIcon } from 'lucide-react';
import LocationSelector from '../locationSelector';
import { useDisclosure, useToast } from '@chakra-ui/react';

type ImageFile = {
  file: File;
  preview: string;
};

type ContactInfo = {
  email: string;
  phone: string;
};

type SocialMediaLinks = {
  facebook: string;
  instagram: string;
  twitter: string;
};

type Location = {
  type: string;
  coordinates: number[];
  displayString: string;
};

type ClubFormData = {
  _id: string,
  username: string;
  email: string;
  displayName: string;
  description: string;
  address: string;
  location: Location;
  capacity: number | string;
  openingHours: {
    [key: string]: {
      isOpen: boolean;
      open: string;
      close: string;
    };
  };
  features: string[];
  genres: string[];
  minAge: number | string;
  dressCode: string;
  contactInfo: ContactInfo;
  socialMediaLinks: SocialMediaLinks;
  images: FileList | null;
  password: string;
};

const ProfileInfo = ({ label, value }: { label: string; value: any }) => (
  <div className="flex items-center justify-between py-2">
    <span className="font-medium text-gray-300">{label}:</span>
    <span className="text-gray-400">{value}</span>
  </div>
);

const ImagePreviews = ({ images, onRemove }: { images: ImageFile[]; onRemove: (index: number) => void }) => (
  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
    {images.map((image: ImageFile, index: number) => (
      <div key={index} className="relative">
        <img
          src={image.preview}
          alt={`Preview ${index + 1}`}
          className="h-[150px] w-[150px] rounded-lg object-cover"
        />
        <button
          onClick={() => onRemove(index)}
          className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
    ))}
  </div>
);

const ProfilePage = () => {
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [clubData, setClubData] = useState<ClubFormData>({
    _id: '',
    location: {
      type: '',
      coordinates: [],
      displayString: '',
    },
    username: 'clubuser123',
    email: 'club@example.com',
    displayName: 'Awesome Club',
    description: 'The best club in town with amazing music and atmosphere.',
    address: '123 Party Street, Clubville, CV 12345',
    capacity: 500,
    openingHours: {
        Monday: { isOpen: true, open: '09:00', close: '17:00' },
        Tuesday: { isOpen: true, open: '09:00', close: '17:00' },
        Wednesday: { isOpen: true, open: '09:00', close: '17:00' },
        Thursday: { isOpen: true, open: '09:00', close: '17:00' },
        Friday: { isOpen: true, open: '09:00', close: '17:00' },
        Saturday: { isOpen: false, open: '00:00', close: '00:00' },
        Sunday: { isOpen: false, open: '00:00', close: '00:00' },
    },
    features: ['Dance Floor', 'VIP Area', 'Smoking Area'],
    genres: ['House', 'Techno', 'Hip-Hop'],
    minAge: 21,
    dressCode: 'Smart Casual',
    contactInfo: {
      email: 'info@awesomeclub.com',
      phone: '+1 (555) 123-4567',
    },
    socialMediaLinks: {
      facebook: 'https://facebook.com/awesomeclub',
      instagram: 'https://instagram.com/awesomeclub',
      twitter: 'https://twitter.com/awesomeclub',
    },
    images: null,
    password: '',
  });


  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if(token) {
      const decoded = jwtDecode<{ username: string }>(token);
      if(decoded.username){
        console.log("Decoded username: " + decoded.username);
        fetchClubByName(decoded.username).then(data => {
            setClubData(data);
            setIsLoading(false);
            console.log(data);
        });
      }
    }

    console.log("Use Effect print: "); console.log(openingHoursToString(clubData.openingHours));
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Revoke existing preview URLs
      selectedImages.forEach(image => URL.revokeObjectURL(image.preview));
  
      // Create new image files array with previews
      const newImages: ImageFile[] = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setSelectedImages(newImages);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
    valueName?: string
  ) => {
    if (typeof e === 'string' && valueName) {
      // This is for NumberInput
      setClubData(prevData => ({
        ...prevData,
        [valueName]: e,
      }));
    } else if (typeof e === 'object' && 'target' in e) {
      // This is for regular inputs
      const { name, value } = e.target;
      setClubData(prevData => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleContactInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClubData(prevData => ({
      ...prevData,
      contactInfo: {
        ...prevData.contactInfo,
        [name]: value,
      },
    }));
  };

  const handleSocialMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClubData(prevData => ({
      ...prevData,
      socialMediaLinks: {
        ...prevData.socialMediaLinks,
        [name]: value,
      },
    }));
  };

  const handleFeaturesChange = (newFeatures: string[]) => {
    setClubData(prevData => ({
      ...prevData,
      features: newFeatures,
    }));
  };

  const handleGenresChange = (newGenres: string[]) => {
    setClubData(prevData => ({
      ...prevData,
      genres: newGenres,
    }));
  };


  const handleOpeningHoursChange = (newOpeningHours: any) => {
    setClubData(prevData => ({
      ...prevData,
      openingHours: newOpeningHours,
    }));
  };


  const toast = useToast();

  const handleSave = async () => {
    try {
      setUploadProgress(0);
      
      // First, upload all images if any are selected
      const uploadedImageUrls: string[] = [];
      
      if (selectedImages.length > 0) {
        for (let i = 0; i < selectedImages.length; i++) {
          const image = selectedImages[i];
          // Assuming you have an uploadImage function that returns the URL
          const imageUrl = (await uploadImage(image.file, 'profilePics')).downloadURL;
          uploadedImageUrls.push(imageUrl);
          
          // Update progress
          setUploadProgress(((i + 1) / selectedImages.length) * 100);
        }
      }

      // Update club data with new image URLs
      const updatedClubData = {
        ...clubData,
        images: uploadedImageUrls, // Add this field to your club data model
      };

      // Update club information
      const res = await updateClub(clubData._id, updatedClubData);
      console.log('Updated club data:', res);

      // Show success message
      toast({
        title: "Profile updated",
        description: "Your club profile has been successfully updated.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "There was an error updating your profile. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return !isLoading ? (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 mt-6">
      <h1 className="text-2xl font-bold text-purple-400">Club Profile</h1>
      
      <div className="grid gap-8 lg:grid-cols-[30%,1fr]">
        {/* Profile Summary */}
        <div className="rounded-2xl bg-gray-900/50 p-6 backdrop-blur-lg">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-24 w-24 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-[2px]">
              <div className="h-full w-full rounded-full bg-gray-900">
                <img
                  src={typeof clubData.images?.[0] === 'string' ? clubData.images[0] : "/default-avatar.svg"}
                  alt={clubData.displayName}
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white">{clubData.displayName}</h2>
            <p className="text-gray-400">{clubData.address}</p>
          </div>
          
          <div className="my-6 h-px bg-gray-800" />
          
          <div className="space-y-3">
            <ProfileInfo label="Email" value={clubData.contactInfo.email} />
            <ProfileInfo label="Phone" value={clubData.contactInfo.phone} />
            <ProfileInfo label="Capacity" value={String(clubData.capacity)} />
            <OpeningHoursInfo label="Opening Hours" value={openingHoursToString(clubData.openingHours)} />
            <ProfileInfo label="Min Age" value={String(clubData.minAge)} />
            <ProfileInfo label="Dress Code" value={clubData.dressCode} />
          </div>
        </div>

        {/* Edit Form */}
        <div className="rounded-2xl bg-gray-900/50 p-6 backdrop-blur-lg">
          <h2 className="mb-6 text-xl font-bold text-white">Edit Club Profile</h2>
          
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Club Name</label>
                <input
                  name="displayName"
                  value={clubData.displayName}
                  onChange={handleInputChange}
                  className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Username</label>
                <input
                  name="username"
                  value={clubData.username}
                  onChange={handleInputChange}
                  className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <input
                  name="email"
                  value={clubData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Location</label>
                <LocationSelector formData={clubData} setFormData={setClubData} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={clubData.capacity}
                  onChange={(e) => handleInputChange(e.target.value, 'capacity')}
                  className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Open Hours</label>
                <button
                  onClick={onOpen}
                  className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white transition-colors hover:bg-gray-700"
                >
                  Edit Weekly Hours
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Description</label>
              <textarea
                name="description"
                value={clubData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Features */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-300">Features</label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {['Dance Floor', 'VIP Area', 'Smoking Area', 'Live Music', 'Karaoke', 'Outdoor Seating'].map((feature) => (
                  <label key={feature} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={clubData.features.includes(feature)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleFeaturesChange([...clubData.features, feature]);
                        } else {
                          handleFeaturesChange(clubData.features.filter(f => f !== feature));
                        }
                      }}
                      className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-300">Club Images</label>
              <div className="rounded-lg border-2 border-dashed border-gray-700 p-6">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex cursor-pointer flex-col items-center justify-center space-y-2"
                >
                  <ImageIcon className="h-12 w-12 text-gray-500" />
                  <span className="text-sm text-gray-400">Click to upload images</span>
                </label>
              </div>
              
              {uploadProgress > 0 && (
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
              
              {selectedImages.length > 0 && (
                <ImagePreviews
                  images={selectedImages}
                  onRemove={(index: number) => {
                    URL.revokeObjectURL(selectedImages[index].preview);
                    setSelectedImages(prev => prev.filter((_, i) => i !== index));
                  }}
                />
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 font-medium text-white transition-all duration-300 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
      </div>
  ) : (
    <SplashScreen />
  );
};

export default ProfilePage;