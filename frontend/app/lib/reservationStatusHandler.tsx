import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, AlertCircle } from 'lucide-react';

const ReservationStatusBadge = ({ status, timestamp, expiryDate }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    // Calculate time remaining if it's an active reservation
    if (status === 'pending' || status === 'accepted') {
      const interval = setInterval(() => {
        const now = new Date();
        const expiry = new Date(expiryDate);
        if (now >= expiry) {
          setTimeRemaining('Past');
          clearInterval(interval);
        } else {
          const diff = expiry.getTime() - now.getTime();
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          setTimeRemaining(`${days}d remaining`);
        }
      }, 1000 * 60); // Update every minute

      return () => clearInterval(interval);
    }
  }, [status, expiryDate]);

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        icon: Clock,
        bgColor: 'bg-yellow-500/10',
        textColor: 'text-yellow-400',
        label: 'Pending'
      },
      accepted: {
        icon: Check,
        bgColor: 'bg-green-500/10',
        textColor: 'text-green-400',
        label: 'Accepted'
      },
      rejected: {
        icon: X,
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-400',
        label: 'Rejected'
      },
      past: {
        icon: AlertCircle,
        bgColor: 'bg-gray-500/10',
        textColor: 'text-gray-400',
        label: 'Past'
      }
    };

    return configs[status] || configs.pending;
  };

  const config = getStatusConfig(status);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex flex-col items-start space-y-1"
    >
      <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full ${config.bgColor}`}>
        <config.icon className={`w-4 h-4 ${config.textColor}`} />
        <span className={`text-sm font-medium ${config.textColor}`}>
          {config.label}
        </span>
      </div>
      
      {timeRemaining && status !== 'past' && (
        <span className="text-xs text-gray-400 ml-2">
          {timeRemaining}
        </span>
      )}
    </motion.div>
  );
};

const ReservationActions = ({
  status,
  onAccept,
  onReject,
  onCancel,
  canModify,
  isClub
}) => {
  if (status === 'past') return null;

  return (
    <div className="flex space-x-2">
      {status === 'pending' && isClub && (
        <>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAccept}
            className="px-4 py-2 bg-green-500/10 text-green-400 rounded-lg
                     hover:bg-green-500/20 transition-colors"
          >
            Accept
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReject}
            className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg
                     hover:bg-red-500/20 transition-colors"
          >
            Reject
          </motion.button>
        </>
      )}

      {status === 'accepted' && !isClub && canModify && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCancel}
          className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg
                   hover:bg-red-500/20 transition-colors"
        >
          Cancel Reservation
        </motion.button>
      )}
    </div>
  );
};

export default function ReservationHandler({
  reservation,
  isClub,
  onStatusChange,
  onCancel
}) {
  const canModifyReservation = () => {
    if (!reservation.startTime) return false;
    const now = new Date();
    const reservationDate = new Date(reservation.startTime);
    const hoursDiff = (reservationDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDiff >= 24; // Can modify if more than 24 hours before reservation
  };

  return (
    <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
      <div className="flex justify-between items-start">
        <ReservationStatusBadge
          status={reservation.status}
          timestamp={reservation.createdAt}
          expiryDate={reservation.startTime}
        />
        
        <ReservationActions
          status={reservation.status}
          onAccept={() => onStatusChange('accepted')}
          onReject={() => onStatusChange('rejected')}
          onCancel={onCancel}
          canModify={canModifyReservation()}
          isClub={isClub}
        />
      </div>
    </div>
  );
}