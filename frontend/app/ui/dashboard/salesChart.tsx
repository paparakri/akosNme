import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Reservation {
  createdAt: string;
  minPrice: number;
}

interface SalesChartProps {
  data: Reservation[];
}

// Update the component definition with proper typing
const SalesChart = ({ data }: SalesChartProps) => {
  const lineColor = useColorModeValue('teal.500', 'teal.300');
  const gridColor = useColorModeValue('gray.200', 'gray.700');

  // Process the reservation data for the chart
  const processData = () => {
    interface MonthlyData {
      [key: string]: {
        name: string;
        reservations: number;
        revenue: number;
      };
    }

    const monthlyData = data.reduce((acc: MonthlyData, reservation: Reservation) => {
      const date = new Date(reservation.createdAt);
      const month = date.toLocaleString('default', { month: 'short' });
      
      if (!acc[month]) {
        acc[month] = {
          name: month,
          reservations: 0,
          revenue: 0
        };
      }
      
      acc[month].reservations++;
      acc[month].revenue += reservation.minPrice || 0;
      
      return acc;
    }, {});

    return Object.values(monthlyData);
  };

  const chartData = processData();

  return (
    <Box h="400px" bg={'white'} p={4} borderRadius="lg" boxShadow="xl">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="reservations"
            stroke={lineColor}
            activeDot={{ r: 8 }}
            name="Reservations"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="revenue"
            stroke="rgba(75, 192, 192, 1)"
            name="Revenue ($)"
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default SalesChart;