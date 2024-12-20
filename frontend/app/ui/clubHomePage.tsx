import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Calendar, TrendingUp, Sparkles, CloudSun, 
  Clock, Bell, ArrowRight, Star, DollarSign, 
  ThumbsUp, MessageSquare, LayoutDashboard 
} from 'lucide-react';
import Link from 'next/link';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

// Temporary mock data - replace with API calls
const mockRevenueData = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 5000 },
  { name: 'Thu', value: 2780 },
  { name: 'Fri', value: 7890 },
  { name: 'Sat', value: 8390 },
  { name: 'Sun', value: 6490 }
];

interface Reservation {
  id: string;
  customerName: string;
  time: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  tableNumber: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  ticketsSold: number;
  totalCapacity: number;
}

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  gradient = "from-blue-500 to-purple-500" 
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="relative p-6 rounded-2xl overflow-hidden"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`} />
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg bg-white/10">
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 ${
            trend > 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            <TrendingUp className={`w-4 h-4 ${
              trend < 0 ? 'transform rotate-180' : ''
            }`} />
            <span className="text-sm font-medium">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-gray-400 text-sm">{title}</h3>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  </motion.div>
);

export default function ClubHomePage() {
  const [todayStats, setTodayStats] = useState({
    reservations: 24,
    expectedGuests: 142,
    revenue: 8750,
    reviews: 12
  });

  const [weatherData, setWeatherData] = useState({
    temp: 22,
    condition: 'Clear',
    isGoodForOutdoor: true
  });

  const [upcomingReservations, setUpcomingReservations] = useState<Reservation[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [recentReviews, setRecentReviews] = useState([]);

  useEffect(() => {
    // TODO: Fetch real data from API
    // 1. Today's statistics
    // const fetchTodayStats = async () => {...}
    
    // 2. Weather data
    // const fetchWeatherData = async () => {...}
    
    // 3. Upcoming reservations
    // const fetchUpcomingReservations = async () => {...}
    
    // 4. Upcoming events
    // const fetchUpcomingEvents = async () => {...}
    
    // 5. Recent reviews
    // const fetchRecentReviews = async () => {...}
  }, []);

  return (
    <div className="min-h-screen w-full pt-16">
      {/* Hero Section with Quick Stats */}
      <div className="relative py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Welcome Back
              </span>
            </h1>
            <p className="text-gray-400">
              Here's what's happening at your venue today
            </p>
          </motion.div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <MetricCard
              title="Today's Reservations"
              value={todayStats.reservations}
              icon={Calendar}
              trend={12}
              gradient="from-blue-500 to-purple-500"
            />
            <MetricCard
              title="Expected Guests"
              value={todayStats.expectedGuests}
              icon={Users}
              trend={8}
              gradient="from-purple-500 to-pink-500"
            />
            <MetricCard
              title="Today's Revenue"
              value={`€${todayStats.revenue}`}
              icon={DollarSign}
              trend={15}
              gradient="from-pink-500 to-red-500"
            />
            <MetricCard
              title="New Reviews"
              value={todayStats.reviews}
              icon={Star}
              trend={-5}
              gradient="from-orange-500 to-yellow-500"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Upcoming Timeline */}
            <div className="lg:col-span-2 space-y-8">
              {/* Revenue Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <h2 className="text-xl font-semibold mb-6">Revenue Trend</h2>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="name" stroke="#ffffff60" />
                      <YAxis stroke="#ffffff60" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#8884d8"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Today's Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Today's Schedule</h2>
                  <Link
                    href="/dashboard/reservations"
                    className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {/* Example Timeline Item */}
                  <div className="relative pl-8 pb-8 border-l-2 border-white/10">
                    <div className="absolute left-[-9px] top-2 w-4 h-4 rounded-full bg-purple-500" />
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">8:00 PM</span>
                        <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                          Confirmed
                        </span>
                      </div>
                      <h3 className="font-medium">VIP Table Reservation</h3>
                      <p className="text-sm text-gray-400">
                        6 guests • Table 12 • John Smith
                      </p>
                    </div>
                  </div>
                  {/* Add more timeline items here */}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Quick Actions & Info */}
            <div className="space-y-8">
              {/* Weather Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Weather Update</h3>
                  <CloudSun className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-3xl font-bold mb-2">{weatherData.temp}°C</div>
                <p className="text-gray-400">
                  {weatherData.isGoodForOutdoor
                    ? "Perfect weather for outdoor seating!"
                    : "Consider indoor arrangements today"}
                </p>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/dashboard">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 
                              text-white font-medium flex items-center justify-center space-x-2 my-4"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Go to Dashboard</span>
                    </motion.button>
                  </Link>
                  <Link href="/dashboard/events/new">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 my-4 
                              text-white font-medium flex items-center justify-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Create New Event</span>
                    </motion.button>
                  </Link>
                  
                  <Link href="/dashboard/tables">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full p-3 rounded-xl bg-white/10 hover:bg-white/20 
                              transition-colors flex items-center justify-center space-x-2 my-4"
                    >
                      <Users className="w-4 h-4" />
                      <span>Manage Tables</span>
                    </motion.button>
                  </Link>
                </div>
              </motion.div>

              {/* Recent Reviews */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Latest Reviews</h3>
                  <Link
                    href="/dashboard/reviews"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-4">
                  {/* Example Review */}
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Sarah M.</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < 4 ? 'text-yellow-400' : 'text-gray-600'
                            }`}
                            fill={i < 4 ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">
                      "Amazing atmosphere and great service! Will definitely come back."
                    </p>
                  </div>
                  {/* Add more reviews here */}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}