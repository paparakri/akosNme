"use client"

import React, { useState } from 'react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import Form1 from './forms/form1';
import Form2 from './forms/form2';
import Form3 from './forms/form3';
import FaqPage from '../faq/page';
import { signInClubUser } from '../../lib/authHelper';

interface PartnershipFeatureProps {
  icon: string;
  title: string;
  description: string;
}

interface PartnershipStepProps extends PartnershipFeatureProps {
  stepNumber: number;
}

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

type ContactInfo = {
  email: string;
  phone: string;
};

type SocialMediaLinks = {
  facebook: string;
  instagram: string;
  twitter: string;
};

type ClubFormData = {
  username: string;
  email: string;
  displayName: string;
  description: string;
  location: string;
  capacity: number | string;
  openingHours: string;
  features: string[];
  genres: string[];
  minAge: number | string;
  dressCode: string;
  contactInfo: ContactInfo;
  socialMediaLinks: SocialMediaLinks;
  images: FileList | null;
  password: string;
};

const PartnershipFeature: React.FC<PartnershipFeatureProps> = ({ icon, title, description }) => (
  <div className="group relative p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative z-10">
      <div className="w-16 h-16 mb-4 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-[2px]">
        <div className="w-full h-full bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center">
          <img src={icon} className="w-8 h-8" alt={title} />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  </div>
);

const PartnershipStep: React.FC<PartnershipStepProps> = ({ icon, title, description, stepNumber }) => (
  <div className="relative group">
    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
        {stepNumber}
      </div>
      <div className="w-16 h-16 mb-4 mx-auto">
        <img src={icon} className="w-full h-full object-contain" alt={title} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
    {stepNumber < 4 && (
      <div className="hidden md:block absolute top-1/2 -right-8 w-16 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500" />
    )}
  </div>
);

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-between w-full max-w-xs mx-auto mb-8">
      {[...Array(totalSteps)].map((_, index) => (
        <React.Fragment key={index}>
          <div className={`relative flex items-center justify-center w-10 h-10 rounded-full 
            ${index + 1 <= currentStep ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-200 dark:bg-gray-700'}
            transition-all duration-300`}>
            <span className={`text-sm font-semibold ${index + 1 <= currentStep ? 'text-white' : 'text-gray-500'}`}>
              {index + 1}
            </span>
            {index + 1 === currentStep && (
              <div className="absolute w-full h-full rounded-full animate-ping bg-blue-500/20" />
            )}
          </div>
          {index < totalSteps - 1 && (
            <div className="w-16 h-0.5 bg-gray-200 dark:bg-gray-700">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${index + 1 < currentStep ? '100%' : '0%'}` }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const ClubPartneringPage: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<ClubFormData>({
    username: '',
    email: '',
    displayName: '',
    description: '',
    location: '',
    capacity: '',
    openingHours: '',
    features: [],
    genres: [],
    minAge: '',
    dressCode: '',
    contactInfo: {
      email: '',
      phone: '',
    },
    socialMediaLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
    },
    images: null,
    password: '',
  });

  const handleNext = (): void => {
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      signInClubUser(formData);
    }
  };

  const handleBack = (): void => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b pt-20 from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Become a 
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              {" "}Partner Club
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join our platform and transform your venue's digital presence. Get discovered by thousands of potential customers.
          </p>
        </div>

        {/* Main Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-8">
            <StepIndicator currentStep={step} totalSteps={3} />
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              {step === 1 && <Form1 formData={formData} setFormData={setFormData} />}
              {step === 2 && <Form2 formData={formData} setFormData={setFormData} />}
              {step === 3 && <Form3 formData={formData} setFormData={setFormData} />}
              
              <div className="flex justify-between mt-8">
                <button
                  onClick={handleBack}
                  disabled={step === 1}
                  className={`px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                    ${step === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                    transition-all duration-200`}
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg
                    transform transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center space-x-2"
                >
                  <span>{step === 3 ? 'Submit' : 'Next'}</span>
                  <ArrowForwardIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold mb-6">Why Partner With Us?</h2>
            <div className="grid gap-6">
              <PartnershipFeature
                icon="/icons/visibility.png"
                title="Increased Visibility"
                description="Get your venue in front of thousands of potential customers actively looking for their next night out."
              />
              <PartnershipFeature
                icon="/icons/reservations.png"
                title="Smart Booking System"
                description="Our intelligent reservation system helps you manage bookings efficiently and reduce no-shows."
              />
              <PartnershipFeature
                icon="/icons/analytics.png"
                title="Powerful Analytics"
                description="Get deep insights into your venue's performance and understand your customers better."
              />
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <PartnershipStep
              icon="/icons/form.png"
              title="Complete the Form"
              description="Provide essential information about your venue"
              stepNumber={1}
            />
            <PartnershipStep
              icon="/icons/review.png"
              title="Quick Review"
              description="Our team will verify your information"
              stepNumber={2}
            />
            <PartnershipStep
              icon="/icons/onboarding.png"
              title="Easy Onboarding"
              description="Get guided through the setup process"
              stepNumber={3}
            />
            <PartnershipStep
              icon="/icons/success.png"
              title="Start Growing"
              description="Launch your profile and welcome new customers"
              stepNumber={4}
            />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <FaqPage />
        </div>
      </div>
    </div>
  );
};

export default ClubPartneringPage;