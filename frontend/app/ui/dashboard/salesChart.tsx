import React from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', sales: 4000, users: 2400 },
  { name: 'Feb', sales: 3000, users: 1398 },
  { name: 'Mar', sales: 2000, users: 9800 },
  { name: 'Apr', sales: 2780, users: 3908 },
  { name: 'May', sales: 1890, users: 4800 },
  { name: 'Jun', sales: 2390, users: 3800 },
  { name: 'Jul', sales: 3490, users: 4300 },
];

const SalesChart = () => {
  const lineColor = useColorModeValue('teal.500', 'teal.300');
  const gridColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box h="400px" bg={'white'} p={4} borderRadius="lg" boxShadow="xl">
      {
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="name" />
          <YAxis />
          <Legend />
          <Line type="monotone" dataKey="sales" stroke={lineColor} activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="users" stroke="rgba(75, 192, 192, 1)" />
        </LineChart>
      </ResponsiveContainer>
      }
    </Box>
  );
};

export default SalesChart;