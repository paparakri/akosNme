import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Calendar, Clock, DollarSign, Users, 
  AlertCircle, Image as ImageIcon, PartyPopper, Music 
} from 'lucide-react';
import { useToast } from '@chakra-ui/react';
import { addEvent } from '@/app/lib/backendAPI';
import { getCurrentUser } from '@/app/lib/userStatus';

const eventTypes = [
  { value: 'Concert', label: 'Concert', icon: Music },
  { value: 'Festival', label: 'Festival', icon: PartyPopper },
  { value: 'DJ Night', label: 'DJ Night', icon: Music },
  { value: 'Live Performance', label: 'Live Performance', icon: Music },
  { value: 'Theme Party', label: 'Theme Party', icon: PartyPopper },
  { value: 'Special Event', label: 'Special Event', icon: PartyPopper }
];

// First, let's define interfaces for our props and form data
interface AddEventProps {
  setCreatingEvent: () => void;
}

interface EventFormData {
  name: string;
  description: string;
  date: string;
  startTime: string;
  price: string;
  availableTickets: string;
  eventType: string;
  minAge: number;
  images: FileList | null;
}

interface FormErrors {
  name?: string;
  description?: string;
  date?: string;
  startTime?: string;
  price?: string;
  availableTickets?: string;
  eventType?: string;
  minAge?: string;
}

// Update the component definition with proper types
const AddEvent: React.FC<AddEventProps> = ({ setCreatingEvent }) => {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [eventData, setEventData] = useState<EventFormData>({
    name: '',
    description: '',
    date: '',
    startTime: '',
    price: '',
    availableTickets: '',
    eventType: '',
    minAge: 21,
    images: null
  });

  const validateStep = (step: number): boolean => {
    const errors: FormErrors = {};
    let isValid = true;
    
    switch(step) {
      case 1:
        if (!eventData.name?.trim()) {
          errors.name = 'Event name is required';
          isValid = false;
        }
        if (!eventData.eventType) {
          errors.eventType = 'Event type is required';
          isValid = false;
        }
        if (!eventData.description?.trim()) {
          errors.description = 'Description is required';
          isValid = false;
        }
        break;
      case 2:
        if (!eventData.date) {
          errors.date = 'Date is required';
          isValid = false;
        }
        if (!eventData.startTime) {
          errors.startTime = 'Start time is required';
          isValid = false;
        }
        if (!eventData.price) {
          errors.price = 'Price is required';
          isValid = false;
        }
        if (!eventData.availableTickets) {
          errors.availableTickets = 'Number of tickets is required';
          isValid = false;
        }
        break;
      case 3:
        // Only validate but don't submit
        if (!eventData.minAge || eventData.minAge < 18) {
          errors.minAge = 'Valid minimum age is required (18+)';
          isValid = false;
        }
        break;
    }
  
    setFormErrors(errors);
    return isValid;
  };

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  }, [currentStep, eventData]);

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setEventData(prev => ({
        ...prev,
        images: e.target.files
      }));
      
      const urls = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => {
        prev.forEach(url => URL.revokeObjectURL(url));
        return urls;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== 3) return; // Only process submission on step 3
    
    // Validate all steps before submitting
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const currentUser = await getCurrentUser();
      await addEvent(currentUser._id, eventData);
      
      toast({
        title: "Success!",
        description: "Your event has been created successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      setCreatingEvent();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                <FileText className="inline-block w-4 h-4 mr-2" />
                Event Name
              </label>
              <input
                type="text"
                name="name"
                value={eventData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-white/5 border ${
                  formErrors.name ? 'border-red-500' : 'border-white/10'
                } rounded-lg focus:border-blue-500 transition-colors`}
                placeholder="Enter event name"
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                <PartyPopper className="inline-block w-4 h-4 mr-2" />
                Event Type
              </label>
              <select
                name="eventType"
                value={eventData.eventType}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-gray-900 border ${
                  formErrors.eventType ? 'border-red-500' : 'border-white/10'
                } rounded-lg focus:border-blue-500 transition-colors text-white [&>option]:bg-gray-900`}
                style={{
                  appearance: 'none',
                  color: 'white',
                  outline: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
                    `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>`
                  )}")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1rem'
                }}
                
              >
                <option value="" className="!bg-gray-900 !text-white">Select event type</option>
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value} className="!bg-gray-900 !text-white">{type.label}</option>
                ))}
              </select>
              {formErrors.eventType && (
                <p className="mt-1 text-sm text-red-500">{formErrors.eventType}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                <FileText className="inline-block w-4 h-4 mr-2" />
                Description
              </label>
              <textarea
                name="description"
                value={eventData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-2 bg-white/5 border ${
                  formErrors.description ? 'border-red-500' : 'border-white/10'
                } rounded-lg focus:border-blue-500 transition-colors`}
                placeholder="Describe your event"
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
              )}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                <Calendar className="inline-block w-4 h-4 mr-2" />
                Date
              </label>
              <input
                type="date"
                name="date"
                value={eventData.date}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-white/5 border ${
                  formErrors.date ? 'border-red-500' : 'border-white/10'
                } rounded-lg focus:border-blue-500 transition-colors`}
              />
              {formErrors.date && (
                <p className="mt-1 text-sm text-red-500">{formErrors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                <Clock className="inline-block w-4 h-4 mr-2" />
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={eventData.startTime}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-white/5 border ${
                  formErrors.startTime ? 'border-red-500' : 'border-white/10'
                } rounded-lg focus:border-blue-500 transition-colors`}
              />
              {formErrors.startTime && (
                <p className="mt-1 text-sm text-red-500">{formErrors.startTime}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                <DollarSign className="inline-block w-4 h-4 mr-2" />
                Ticket Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-400">€</span>
                <input
                  type="number"
                  name="price"
                  value={eventData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`w-full pl-8 pr-4 py-2 bg-white/5 border ${
                    formErrors.price ? 'border-red-500' : 'border-white/10'
                  } rounded-lg focus:border-blue-500 transition-colors`}
                  placeholder="0.00"
                />
              </div>
              {formErrors.price && (
                <p className="mt-1 text-sm text-red-500">{formErrors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                <Users className="inline-block w-4 h-4 mr-2" />
                Available Tickets
              </label>
              <input
                type="number"
                name="availableTickets"
                value={eventData.availableTickets}
                onChange={handleChange}
                min="1"
                className={`w-full px-4 py-2 bg-white/5 border ${
                  formErrors.availableTickets ? 'border-red-500' : 'border-white/10'
                } rounded-lg focus:border-blue-500 transition-colors`}
                placeholder="Enter number of tickets"
              />
              {formErrors.availableTickets && (
                <p className="mt-1 text-sm text-red-500">{formErrors.availableTickets}</p>
              )}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                <AlertCircle className="inline-block w-4 h-4 mr-2" />
                Minimum Age
              </label>
              <input
                type="number"
                name="minAge"
                value={eventData.minAge}
                onChange={handleChange}
                min="18"
                className={`w-full px-4 py-2 bg-white/5 border ${
                  formErrors.minAge ? 'border-red-500' : 'border-white/10'
                } rounded-lg focus:border-blue-500 transition-colors`}
                placeholder="Enter minimum age requirement"
              />
              <p className="mt-1 text-sm text-gray-400">
                Minimum age requirement for attendees
              </p>
              {formErrors.minAge && (
                <p className="mt-1 text-sm text-red-500">{formErrors.minAge}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                <ImageIcon className="inline-block w-4 h-4 mr-2" />
                Event Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 transition-colors"
              />
              <p className="mt-1 text-sm text-gray-400">
                Upload one or more images for your event
              </p>

              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {previewUrls.map((url, index) => (
                    <div
                      key={url}
                      className="relative aspect-square rounded-lg overflow-hidden border border-white/10"
                    >
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Create New Event
          </h2>
          <p className="mt-2 text-gray-400">Fill in the details below to create your event</p>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-6">
          <div className="relative">
            <div className="absolute top-1/2 h-0.5 w-full bg-gray-700 transform -translate-y-1/2">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="relative flex justify-between">
              {[1, 2, 3].map((step) => (
                <motion.div
                  key={step}
                  className={`w-10 h-10 rounded-full flex items-center justify-center 
                    ${step <= currentStep 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                      : 'bg-gray-700'}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-white font-medium">{step}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <AnimatePresence mode="wait">
            {renderFormStep()}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <motion.button
              type="button"
              onClick={handlePrevious}
              className={`px-6 py-2 rounded-lg border border-white/10 text-gray-300 
                transition-colors hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={currentStep === 1 || isSubmitting}
            >
              Previous
            </motion.button>

            <div className="flex gap-4">
              <motion.button
                type="button"
                onClick={() => setCreatingEvent()}
                className="px-6 py-2 rounded-lg bg-red-500/10 text-red-400 
                  transition-colors hover:bg-red-500/20 disabled:opacity-50 
                  disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
              >
                Cancel
              </motion.button>

              {currentStep < 3 ? (
                <motion.button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 
                    to-purple-500 text-white transition-all hover:shadow-lg 
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                >
                  Continue
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 
                    to-purple-500 text-white transition-all hover:shadow-lg 
                    disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Creating Event...</span>
                    </>
                  ) : (
                    <>
                      <PartyPopper className="w-5 h-5" />
                      <span>Create Event</span>
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEvent;