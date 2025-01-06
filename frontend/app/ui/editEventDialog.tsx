import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  Clock,
  DollarSign, 
  Users,
  AlertTriangle,
  X,
  Save,
  Calendar as CalendarIcon,
  Type,
  FileText,
  Tag
} from 'lucide-react';
import EnhancedDatePicker from './datepicker';

// Types
interface EditEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onUpdateEvent: (updatedEvent: Event) => Promise<void>;
}

interface Event {
  _id: string;
  name: string;
  description: string;
  date: string;
  startTime: string;
  price: number;
  availableTickets: number;
  eventType: string;
  minAge: number;
}

interface ValidationErrors {
  name?: string;
  description?: string;
  date?: string;
  startTime?: string;
  price?: string;
  availableTickets?: string;
  eventType?: string;
  minAge?: string;
}

const EditEventDialog: React.FC<EditEventDialogProps> = ({
  isOpen,
  onClose,
  event,
  onUpdateEvent
}) => {
  const [formData, setFormData] = useState<Event | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showDateWarning, setShowDateWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [originalDate, setOriginalDate] = useState<string>('');
  const [originalStartTime, setOriginaStartTime] = useState<string>('');
  const [startTimeString, setStartTimeString] = useState<string>('');


  console.log(formData)

  useEffect(() => {
    if (event) {
      const startTime = new Date(event.startTime);
      const hours = startTime.getHours().toString().padStart(2, '0');
      const minutes = startTime.getMinutes().toString().padStart(2, '0');
      setStartTimeString(`${hours}:${minutes}`);
      setFormData({ ...event});
      setOriginalDate(event.date);
      setOriginaStartTime(event.startTime);
    }
  }, [event]);

  useEffect(() => {
    if (originalDate && event) {
      console.log("Original Date: ", event.date);
      console.log("Original Date State Variable after update:", originalDate);
    }
  }, [originalDate, event]);

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'name':
        return !value.trim() ? 'Event name is required' : '';
      case 'description':
        return !value.trim() ? 'Description is required' : '';
      case 'date':
        const selectedDate = new Date(value);
        const today = new Date();
        return selectedDate < today ? 'Date cannot be in the past' : '';
      case 'price':
        return value < 0 ? 'Price cannot be negative' : '';
      case 'availableTickets':
        return value < 1 ? 'Must have at least 1 available ticket' : '';
      case 'minAge':
        return value < 18 || value > 100 ? 'Age must be between 18 and 100' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Check if date is being changed
    if (name === 'date' && value !== originalDate) {
      setShowDateWarning(true);
    }

    // If startTime is being changed, create a new Date object
    if (name === 'startTime') {
      const updatedDate = new Date(originalStartTime); // Use the original date
      const [hours, minutes] = value.split(':'); // Split the time string
      updatedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10)); // Set the new time
      
      setFormData(prev => {
        if (!prev) return null;
        return { ...prev, [name]: updatedDate.toISOString() };
      });
      
      const newStartTime = new Date(updatedDate.toISOString());
      const newHours = newStartTime.getHours().toString().padStart(2, '0');
      const newMinutes = newStartTime.getMinutes().toString().padStart(2, '0');
      setStartTimeString(`${newHours}:${newMinutes}`);

      return null;
    }

    setFormData(prev => {
      if (!prev) return null;
      return { ...prev, [name]: value };
    });

    // Validate field
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleDateChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    
    if (value !== originalDate) {
      setShowDateWarning(true);
    }

    setFormData(prev => {
      if (!prev) return null;
      return { ...prev, [name]: value };
    });

    // Validate field
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    console.log("Data trying");

    // Validate all fields
    const newErrors: ValidationErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof Event]);
      if (error) newErrors[key as keyof ValidationErrors] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await onUpdateEvent(formData);
      onClose();
    } catch (error) {
      console.error('Failed to update event:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !formData) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-white/10"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Edit Event</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Date Warning Dialog */}
          <AnimatePresence>
            {showDateWarning && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start space-x-3"
              >
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-yellow-500 font-medium mb-1">Important Notice</h4>
                  <p className="text-sm text-yellow-500/90">
                    Changing the event date will notify all current reservation holders. 
                    They will have the option to cancel their reservations without penalties.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDateWarning(false)}
                  className="text-yellow-500/80 hover:text-yellow-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Event Name</label>
              <div className="relative">
                <Type className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full bg-white/5 border ${errors.name ? 'border-red-500' : 'border-white/10'} 
                    rounded-lg px-4 py-2 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors`}
                  placeholder="Enter event name"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full bg-white/5 border ${errors.description ? 'border-red-500' : 'border-white/10'} 
                    rounded-lg px-4 py-2 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors`}
                  placeholder="Enter event description"
                />
              </div>
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
            </div>

            {/* Two Columns Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Field */}
              <div>
                <div className="relative">
                <EnhancedDatePicker 
                    value={formData.date}
                    onChange={handleDateChange}
                    isRequired={true}
                    isInvalid={!!errors.date}
                    errorMsg={errors.date}
                    label="Select Date"
                    onCalendarClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        // Your calendar toggle logic here
                    }}
                />
                </div>
                {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
              </div>

              {/* Time Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Start Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="time"
                    name="startTime"
                    value={startTimeString}
                    onChange={handleInputChange}
                    className={`w-full bg-white/5 border ${errors.startTime ? 'border-red-500' : 'border-white/10'} 
                      rounded-lg px-4 py-2 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors`}
                  />
                </div>
                {errors.startTime && <p className="mt-1 text-sm text-red-500">{errors.startTime}</p>}
              </div>

              {/* Price Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Price</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full bg-white/5 border ${errors.price ? 'border-red-500' : 'border-white/10'} 
                      rounded-lg px-4 py-2 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors`}
                  />
                </div>
                {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
              </div>

              {/* Available Tickets Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Available Tickets</label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="availableTickets"
                    value={formData.availableTickets}
                    onChange={handleInputChange}
                    min="1"
                    className={`w-full bg-white/5 border ${errors.availableTickets ? 'border-red-500' : 'border-white/10'} 
                      rounded-lg px-4 py-2 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors`}
                  />
                </div>
                {errors.availableTickets && <p className="mt-1 text-sm text-red-500">{errors.availableTickets}</p>}
              </div>

              {/* Event Type Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Event Type</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleInputChange}
                    className={`w-full bg-white/5 border ${errors.eventType ? 'border-red-500' : 'border-white/10'} 
                      rounded-lg px-4 py-2 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors`}
                  >
                    <option value="regular">Regular</option>
                    <option value="special">Special</option>
                    <option value="featured">Featured</option>
                  </select>
                </div>
                {errors.eventType && <p className="mt-1 text-sm text-red-500">{errors.eventType}</p>}
              </div>

              {/* Minimum Age Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Minimum Age</label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="minAge"
                    value={formData.minAge}
                    onChange={handleInputChange}
                    min="18"
                    max="100"
                    className={`w-full bg-white/5 border ${errors.minAge ? 'border-red-500' : 'border-white/10'} 
                      rounded-lg px-4 py-2 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors`}
                  />
                  </div>
                {errors.minAge && <p className="mt-1 text-sm text-red-500">{errors.minAge}</p>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || Object.keys(errors).length > 0}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg
                hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditEventDialog;