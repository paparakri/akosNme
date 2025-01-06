import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Users, MapPin, DollarSign, MessageCircle, 
  Phone, Mail, X, Check, AlertCircle, History,
  LucideIcon
} from 'lucide-react';

type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'past';

interface StatusBadgeProps {
  status: ReservationStatus;
}

interface DetailItemProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
}

interface Reservation {
  _id: string;
  club: string;
  user: string;
  event: string;
  date: string;
  startTime: string;
  numOfGuests: number;
  status: 'pending' | 'approved' | 'rejected' | 'past';
  specialRequests?: string;
  minPrice: number;
  customerName?: string;
  email?: string;
  phoneNumber?: string;
  createdAt: string;
  tableNumber: string;
}

interface ReservationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onMessageCustomer: () => void;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    approved: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
    past: 'bg-gray-500/20 text-gray-400'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const DetailItem = ({ icon: Icon, label, value }: DetailItemProps) => (
  <div className="flex items-start space-x-3">
    <div className="p-2 rounded-lg bg-gray-800">
      <Icon className="w-4 h-4 text-gray-400" />
    </div>
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-white font-medium">{value}</p>
    </div>
  </div>
);

const ReservationDetailsModal = ({ 
  isOpen, 
  onClose, 
  reservation, 
  onApprove, 
  onReject,
  onMessageCustomer 
}: ReservationDetailsModalProps) => {
  if (!reservation) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-gray-900 shadow-xl"
            >
              {/* Header */}
              <div className="relative p-6 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Reservation Details
                    </h3>
                    <p className="text-sm text-gray-400">ID: {reservation._id}</p>
                  </div>
                  <StatusBadge status={reservation.status} />
                </div>
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-6 pb-6">
                <div className="space-y-6">
                  {/* Customer Info */}
                  <div className="rounded-xl bg-gray-800/50 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-white">
                          {reservation.customerName}
                        </h4>
                        <p className="text-sm text-gray-400">Customer Details</p>
                      </div>
                      <button
                        onClick={onMessageCustomer}
                        className="flex items-center space-x-2 rounded-lg bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-400 hover:bg-blue-500/20"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Message Customer</span>
                      </button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <DetailItem
                        icon={Mail}
                        label="Email"
                        value={reservation.email || "N/A"}
                      />
                      <DetailItem
                        icon={Phone}
                        label="Phone"
                        value={reservation.phoneNumber || "N/A"}
                      />
                    </div>
                  </div>

                  {/* Reservation Details */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <DetailItem
                      icon={Calendar}
                      label="Date"
                      value={reservation.date}
                    />
                    <DetailItem
                      icon={Clock}
                      label="Time"
                      value={`${new Date(reservation.startTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit'
                      })}`}
                    />
                    <DetailItem
                      icon={Users}
                      label="Number of Guests"
                      value={reservation.numOfGuests}
                    />
                    <DetailItem
                      icon={MapPin}
                      label="Table Number"
                      value={reservation.tableNumber || "Not specified"}
                    />
                    <DetailItem
                      icon={DollarSign}
                      label="Minimum Spend"
                      value={`$${reservation.minPrice}`}
                    />
                    <DetailItem
                      icon={History}
                      label="Created"
                      value={new Date(reservation.createdAt).toLocaleDateString()}
                    />
                  </div>

                  {/* Special Requests */}
                  {reservation.specialRequests && (
                    <div className="rounded-xl bg-purple-500/10 p-4">
                      <div className="mb-2 flex items-center space-x-2 text-purple-400">
                        <AlertCircle className="h-5 w-5" />
                        <h4 className="font-medium">Special Requests</h4>
                      </div>
                      <p className="text-gray-300">{reservation.specialRequests}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {reservation.status === 'pending' && (
                    <div className="flex space-x-3 pt-2">
                      <button
                        onClick={() => {
                          onApprove(reservation._id);
                          onClose();
                        }}
                        className="flex flex-1 items-center justify-center space-x-2 rounded-lg bg-green-500/10 py-3 font-medium text-green-400 hover:bg-green-500/20"
                      >
                        <Check className="h-5 w-5" />
                        <span>Approve Reservation</span>
                      </button>
                      <button
                        onClick={() => {
                          onReject(reservation._id);
                          onClose();
                        }}
                        className="flex flex-1 items-center justify-center space-x-2 rounded-lg bg-red-500/10 py-3 font-medium text-red-400 hover:bg-red-500/20"
                      >
                        <X className="h-5 w-5" />
                        <span>Reject Reservation</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReservationDetailsModal;