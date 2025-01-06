import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, AlertCircle } from 'lucide-react';

type ReservationStatus = 'pending' | 'accepted' | 'rejected' | 'past';

interface StatusConfig {
  icon: typeof Clock;
  bgColor: string;
  textColor: string;
  label: string;
}

interface StatusBadgeProps {
  status: ReservationStatus;
  timestamp: string;
  expiryDate: string;
}

interface ActionProps {
  status: ReservationStatus;
  onAccept: () => void;
  onReject: () => void;
  onCancel: () => void;
  canModify: boolean;
  isClub: boolean;
}

interface Reservation {
  status: ReservationStatus;
  startTime: string;
  createdAt: string;
}

interface ReservationHandlerProps {
  reservation: Reservation;
  isClub: boolean;
  onStatusChange: (status: ReservationStatus) => void;
  onCancel: () => void;
}

const ReservationStatusBadge: React.FC<StatusBadgeProps> = ({ status, timestamp, expiryDate }) => {
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  useEffect(() => {
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
      }, 1000 * 60);

      return () => clearInterval(interval);
    }
  }, [status, expiryDate]);

  const getStatusConfig = (status: ReservationStatus): StatusConfig => {
    const configs: Record<ReservationStatus, StatusConfig> = {
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

    return configs[status];
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

const ReservationActions: React.FC<ActionProps> = ({
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

const ReservationHandler: React.FC<ReservationHandlerProps> = ({
  reservation,
  isClub,
  onStatusChange,
  onCancel
}) => {
  const canModifyReservation = (): boolean => {
    if (!reservation.startTime) return false;
    const now = new Date();
    const reservationDate = new Date(reservation.startTime);
    const hoursDiff = (reservationDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDiff >= 24;
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
};

export default ReservationHandler;