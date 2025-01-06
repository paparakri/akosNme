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
  Tooltip, ResponsiveContainer, BarChart, Bar, 
  Legend
} from 'recharts';
import { fetchTodayStats, fetchWeatherData, fetchRecentReviews, fetchUpcomingEvents, fetchUpcomingReservations, fetchClubChartData } from '../lib/clubHelper';
import { getCurrentUser } from '../lib/userStatus';

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
  _id: string;
  firstName: string;
  lastName: string;
  time: string;
  numOfGuests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  tableNumber: string;
  specialRequests: string;
  startTime: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  ticketsSold: number;
  totalCapacity: number;
}

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  trend?: number;
  gradient?: string;
}

interface Review {
  _id: string;
  username: string;
  rating: number;
  reviewText: string;
  createdAt: string;
}

interface TodayStats {
  reservations: Reservation[];
  expectedGuests: number;
  revenue: number;
  reviews: number;
}

interface ChartDataPoint {
  date: string;
  reservations: number;
}

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  gradient = "from-blue-500 to-purple-500" 
}: MetricCardProps) => (
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
  const [todayStats, setTodayStats] = useState<TodayStats>({
    reservations: [],
    expectedGuests: 142,
    revenue: 8750,
    reviews: 12
  });

  const [weatherData, setWeatherData] = useState({
    temp: 22,
    condition: 'Clear',
    isGoodForOutdoor: true,
    outdoorRecommendation: ""
  });

  const [upcomingReservations, setUpcomingReservations] = useState<Reservation[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [clubUrlName, setClubUrlName] = useState('');
  useEffect(() => {
    const fetchClubData = async () => {
      const club = await getCurrentUser();
      const clubId = club._id;

      setClubUrlName(club.username);

      const todayStats = await fetchTodayStats(clubId);
      setTodayStats(todayStats);

      const weatherData = await fetchWeatherData({lat: club.location.coordinates[1], lng: club.location.coordinates[0]});
      setWeatherData(weatherData);

      const upcomingReservations = await fetchUpcomingReservations(clubId);
      setUpcomingReservations(upcomingReservations);
      console.log("Upcoming Reservations: ", upcomingReservations);

      const upcomingEvents = await fetchUpcomingEvents(clubId);
      setUpcomingEvents(upcomingEvents);
      console.log("Upcoming Events: ", upcomingEvents);

      const recentReviews = await fetchRecentReviews(clubId);
      setRecentReviews(recentReviews);
      console.log("Recent Reviews: ", recentReviews);

      const chartData = await fetchClubChartData(clubId);
      setChartData(chartData);
    };
    fetchClubData();
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
              Here&apos;s what&apos;s happening at your venue today
            </p>
          </motion.div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-12">
            <MetricCard
              title="Today's Reservations"
              value={todayStats.reservations.length}
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
              <ReservationChart data={chartData} />
              {/* Today's Timeline */}
              <TodaySchedule data={todayStats.reservations}/>
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
                    ? "Ok weather for outdoor seating!"
                    : "Consider indoor arrangements today"}
                </p>
                <p>
                  {weatherData.outdoorRecommendation}
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
                  <Link href="/dashboard/events">
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
                    href={`/club/${clubUrlName}`}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-4">
                  {/* Example Review */}
                  {recentReviews.slice(-2).reverse().map((review) => (<MiniReview key={review._id} review={review} />))}
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

interface TodayScheduleProps {
  data: Reservation[];
}

const TodaySchedule = ({ data }: TodayScheduleProps) => {
  console.log("Today's Schedule data: ", data);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Today&apos;s Schedule</h2>
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
        {data.map((reservation) => {
          return(
            <div className="relative pl-8 pb-8 border-l-2 border-white/10" key={reservation._id}>
              <div className="absolute left-[-9px] top-2 w-4 h-4 rounded-full bg-purple-500" />
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">{new Date(reservation.startTime).toTimeString().slice(0,5)}</span>
                  <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                    {reservation.status}
                  </span>
                </div>
                <h3 className="font-medium">{reservation.specialRequests}</h3>
                <p className="text-sm text-gray-400">
                  {reservation.numOfGuests} guests • Table {reservation.tableNumber ? (reservation.tableNumber) : ("Number Not Specified")} • {reservation.firstName + " " + reservation.lastName}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

interface ReservationChartProps {
  data: ChartDataPoint[];
}

const ReservationChart = ({ data }: ReservationChartProps) => {
  console.log("Chart data: ", data);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
    >
      <h2 className="text-xl font-semibold mb-6">Reservation Trend</h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis 
              dataKey="date" 
              stroke="#ffffff60"
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              stroke="#ffffff60"
              label={{ value: '# Reservations', angle: -90, position: 'insideLeft', style: { fill: '#ffffff60' } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff'
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="reservations"
              name="Reservations"
              stroke="#4ade80"
              strokeWidth={2}
              dot={{ fill: '#4ade80' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

interface MiniReviewProps {
  review: Review;
}

const MiniReview = ({ review }: MiniReviewProps) => {
  return (
    <div className="p-4 rounded-xl bg-white/5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{review.username}</span>
        <div className="flex items-center">
          <span className="text-[10px] text-gray-400 mx-2">{new Date(review.createdAt).toLocaleDateString('pt-BR')}</span>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < review.rating ? 'text-yellow-400' : 'text-gray-600'
              }`}
              fill={i < review.rating ? 'currentColor' : 'none'}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-400">
        {review.reviewText}
      </p>
    </div>
  );
}