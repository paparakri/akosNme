import React, { useEffect, useRef, useState } from 'react';
import { FiDollarSign, FiUsers, FiCalendar, FiStar, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { jwtDecode } from 'jwt-decode';
import { fetchClubByName, fetchClubReservations, fetchEventById } from '../../lib/backendAPI';
import { IconType } from 'react-icons';
import { motion, useInView } from 'framer-motion';
import { ArrowDown, ArrowUp, DollarSign, Users } from 'lucide-react';
import { format, parse, isValid } from 'date-fns';
import _ from 'lodash';

interface StatCardProps {
  title: string;
  stat: string | number;
  icon: React.ElementType;
  change?: number;
  isLoading?: boolean;
  description?: string;
  gradient?: string;
}

interface AnalyticsChartProps {
  data: any[];
  isLoading: boolean;
};

interface ClubData {
  _id: string;
  reservations: Array<Object>;
  rating: number;
  events: Array<Object>;
  followers: Array<any>;
};

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  stat, 
  icon: Icon, 
  change, 
  isLoading, 
  description,
  gradient = "from-blue-500 to-purple-600"
}) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true });
  const [animatedStat, setAnimatedStat] = useState(0);
  
  // Animate the stat number when in view
  useEffect(() => {
    if (isInView && !isLoading && typeof stat === 'number') {
      const duration = 1500;
      const steps = 60;
      const stepValue = stat / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += stepValue;
        if (current > stat) {
          setAnimatedStat(stat);
          clearInterval(timer);
        } else {
          setAnimatedStat(current);
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [isInView, stat, isLoading]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all duration-500"
    >
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black to-gray-900 opacity-60" />
      <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-3xl transition-all duration-500 group-hover:opacity-30`} />
      <div className={`absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-3xl transition-all duration-500 group-hover:opacity-20`} />
      
      {/* Glass reflection effect */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="relative flex items-start justify-between">
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        >
          <p className="text-sm font-medium text-gray-200/80">{title}</p>
          {isLoading ? (
            <div className="h-8 w-32 animate-pulse rounded-lg bg-white/10" />
          ) : (
            <div className="flex items-baseline space-x-2">
              <motion.span 
                className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
              >
                {typeof stat === 'number' ? Math.round(animatedStat) : stat}
              </motion.span>
              {change !== undefined && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    change >= 0
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {change >= 0 ? (
                    <FiTrendingUp className="h-3 w-3" />
                  ) : (
                    <FiTrendingDown className="h-3 w-3" />
                  )}
                  <span>{Math.abs(change)}%</span>
                </motion.span>
              )}
            </div>
          )}
          {description && (
            <motion.p 
              className="text-sm text-gray-400"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {description}
            </motion.p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
          className="relative"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 blur-xl rounded-xl transition-all duration-300 group-hover:opacity-30`} />
          <div className="relative rounded-xl bg-white/10 backdrop-blur-sm p-3 transition-all duration-300 group-hover:bg-white/15">
          <Icon className={`h-6 w-6 transition-transform duration-300 group-hover:scale-110 ${
              gradient.includes('blue') 
                ? 'text-blue-500' 
                : gradient.includes('purple') 
                  ? 'text-purple-500' 
                  : 'text-blue-500'
            }`} />
          </div>
        </motion.div>
      </div>

      {/* Hover effects */}
      <div className="absolute inset-0 rounded-2xl transition-all duration-300 group-hover:bg-white/5" />
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 transition-all duration-300 group-hover:opacity-5`} />
    </motion.div>
  );
};

const AnalyticsChart: React.FC<{ data: any[]; isLoading: boolean }> = ({ data, isLoading }) => {
  const [selectedDataKey, setSelectedDataKey] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  console.log("chartData: ", chartData);

  // Format date helper function
  const formatDateString = (dateStr: string) => {
    // Try parsing as DD/MM/YYYY first
    const parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date());
    
    if (isValid(parsedDate)) {
      return format(parsedDate, 'MMM yyyy'); // Changed format to include year
    }
    
    // If that fails, try parsing as a full date string
    const date = new Date(dateStr);
    if (isValid(date)) {
      return format(date, 'MMM yyyy'); // Changed format to include year
    }
    
    return dateStr; // Return original string if parsing fails
  };

  useEffect(() => {
    if (!isLoading && data) {
      // Format dates in the data
      const formattedData = data.map(item => ({
        ...item,
        name: formatDateString(item.name)
      }));
  
      // Merge entries with the same month using lodash
      const mergedData = _(formattedData)
        .groupBy('name')
        .map((group, name) => ({
          name,
          reservations: _.sumBy(group, 'reservations')
        }))
        .value()
        .sort((a, b) => {
          // Parse "MMM YYYY" format strings
          const [aMonth, aYear] = a.name.split(' ');
          const [bMonth, bYear] = b.name.split(' ');
          
          // Convert month names to numbers (0-11)
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const aMonthNum = months.indexOf(aMonth);
          const bMonthNum = months.indexOf(bMonth);
          
          // Compare years first, then months
          const yearDiff = parseInt(aYear) - parseInt(bYear);
          if (yearDiff !== 0) return yearDiff;
          return aMonthNum - bMonthNum;
        });
       
      // Animate data loading
      const timer = setTimeout(() => {
        setChartData(mergedData);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [data, isLoading]);

  // Calculate trends
  const calculateTrend = () => {
    if (!data || data.length < 2) return 0;
    const lastValue = data[data.length - 1].reservations;
    const previousValue = data[data.length - 2].reservations;
    return ((lastValue - previousValue) / previousValue) * 100;
  };

  const reservationsTrend = calculateTrend();

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-lg"
      >
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200/20" />
          <div className="h-[400px] animate-pulse rounded-xl bg-gray-200/10">
            <div className="h-full w-full bg-gradient-to-br from-gray-200/5 to-gray-100/5" />
          </div>
        </div>
      </motion.div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-black/90 backdrop-blur-md p-4 shadow-xl border border-white/10"
        >
          <p className="text-gray-400 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-white">
                {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-lg"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black to-gray-900 opacity-60" />
      <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
      
      {/* Content */}
      <div className="relative">
        {/* Stats Overview */}
        <div className="mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-xl bg-white/5 p-4 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-gray-300">Reservations</span>
              </div>
              <div className={`flex items-center space-x-1 rounded-full px-2 py-1 text-xs ${
                reservationsTrend >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {reservationsTrend >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                <span>{Math.abs(reservationsTrend).toFixed(1)}%</span>
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
              {data[data.length - 1]?.reservations.toLocaleString()}
            </p>
          </motion.div>
        </div>

        {/* Chart */}
        <div className="h-[400px] w-full">
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              onMouseMove={(e) => {
                if (e.activePayload) {
                  setHoveredPoint(e.activePayload[0].payload);
                }
              }}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                <linearGradient id="reservationsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>

              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255,255,255,0.1)" 
                vertical={false}
              />
              
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                tick={{ fill: '#9ca3af' }}
                tickLine={{ stroke: '#6b7280' }}
              />
              
              <YAxis
                stroke="#6b7280"
                tick={{ fill: '#9ca3af' }}
                tickLine={{ stroke: '#6b7280' }}
              />
              
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: 'rgba(255,255,255,0.2)' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="reservations"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ stroke: '#f97316', strokeWidth: 2, r: 4, fill: '#fff' }}
                activeDot={{ r: 8, stroke: '#f97316', strokeWidth: 2 }}
                fillOpacity={1}
                fill="url(#reservationsGradient)"
              />

              {hoveredPoint && (
                <ReferenceLine
                  x={hoveredPoint.name}
                  stroke="rgba(255,255,255,0.2)"
                  strokeDasharray="3 3"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard: React.FC = () => {
  const [clubData, setClubData] = useState<ClubData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) throw new Error('No auth token found');

        const decoded = jwtDecode<{ username: string }>(token);
        if (!decoded.username) throw new Error('Invalid token');

        const clubInfo = await fetchClubByName(decoded.username);

        const reservations = await fetchClubReservations(clubInfo._id);
        const events = await Promise.all((clubInfo.events || []).map(async (event: string) => {
          const eventInfo = await fetchEventById(event);
          return eventInfo;
        }));

        const informedClubInfo = {
          ...clubInfo,
          reservations,
          events,
        };

        setClubData(informedClubInfo);
      } catch (err) {
        console.error('Error fetching club data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate metrics
  const calculateMetrics = () => {
    if (!clubData) return null;

    const currentMonth = new Date().getMonth();
    const currentMonthReservations = clubData.reservations?.filter((res: any) => 
      new Date(res.createdAt).getMonth() === currentMonth
    );

    const lastMonthReservations = clubData.reservations?.filter((res: any) => 
      new Date(res.createdAt).getMonth() === currentMonth - 1
    );
    const currentMonthEvents = clubData.events?.filter((event: any) => 
      new Date(event.date).getTime() <= new Date().getTime() + 30 * 24 * 60 * 60 * 1000
    );

    return {
      totalReservations: clubData.reservations?.length || 0,
      reservationGrowth: lastMonthReservations?.length 
        ? ((currentMonthReservations?.length - lastMonthReservations?.length) / lastMonthReservations?.length) * 100 
        : 0,
      averageRating: clubData.rating || 0,
      upcomingEvents: currentMonthEvents?.length || 0,
      totalFollowers: clubData.followers?.length || 0
    };
  };

  const metrics = calculateMetrics();

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4">
        <div className="flex items-center space-x-3">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
          </svg>
          <span className="font-medium text-red-800">Error loading dashboard: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-purple-400">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your venue&apos;s performance and insights
          </p>
        </div>
        
        {/*
        <div className="flex items-center space-x-2 rounded-full bg-green-100 px-3 py-1">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-sm font-medium text-green-800">Live Updates</span>
        </div>
        */}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Reservations"
          stat={metrics?.totalReservations || 0}
          icon={FiDollarSign}
          change={metrics?.reservationGrowth}
          isLoading={isLoading}
          description="Total bookings this period"
        />
        <StatCard
          title="Followers"
          stat={metrics?.totalFollowers || 0}
          icon={FiUsers}
          isLoading={isLoading}
          description="People following your venue"
        />
        <StatCard
          title="Upcoming Events"
          stat={metrics?.upcomingEvents || 0}
          icon={FiCalendar}
          isLoading={isLoading}
          description="Events in the next 30 days"
        />
        <StatCard
          title="Average Rating"
          stat={`${metrics?.averageRating?.toFixed(1) || '0.0'}/5.0`}
          icon={FiStar}
          isLoading={isLoading}
          description="Based on customer reviews"
        />
      </div>

      {/* Analytics Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Reservation Analytics</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600">Reservations</span>
            </div>
          </div>
        </div>
        <AnalyticsChart 
          data={clubData?.reservations?.map((res: any) => {
            let date = new Date(res.date);
            if (isNaN(date.getTime())) {
              let parts = res.date.split("-");
              date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
            return {
              name: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
              reservations: 1,
              revenue: 0
            }
          }) || []} 
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Dashboard;