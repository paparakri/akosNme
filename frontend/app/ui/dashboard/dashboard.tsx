'use client'; // This ensures the entire file runs as a Client Component

import React from 'react';
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Flex,
  Text,
  Icon,
} from '@chakra-ui/react';
import { FiDollarSign, FiUsers, FiUserPlus, FiShoppingCart } from 'react-icons/fi';
import dynamic from 'next/dynamic';

// Dynamically import the SalesChart to ensure it runs on the client side only
const SalesChart = dynamic(() => import('./salesChart'), { ssr: false });

interface StatCardProps {
  title: string;
  stat: string;
  icon: React.ElementType;
  change: number;
}

function StatCard(props: StatCardProps) {
  const { title, stat, icon, change } = props;
  return (
    <Stat
      px={{ base: 2, md: 4 }}
      py={'5'}
      shadow={'xl'}
      border={'1px solid'}
      borderColor={'gray.200'}
      rounded={'lg'}
      bg={'white'}
    >
      <Flex justifyContent={'space-between'}>
        <Box pl={{ base: 2, md: 4 }}>
          <StatLabel fontWeight={'medium'} isTruncated>
            {title}
          </StatLabel>
          <StatNumber fontSize={'2xl'} fontWeight={'medium'}>
            {stat}
          </StatNumber>
        </Box>
        <Box my={'auto'} color={'gray.800'} alignContent={'center'}>
          <Icon as={icon} w={10} h={10} />
        </Box>
      </Flex>
      <StatHelpText alignSelf={'flex-end'}>
        <StatArrow type={change > 0 ? 'increase' : 'decrease'} />
        {Math.abs(change)}%
      </StatHelpText>
    </Stat>
  );
}

const Dashboard = () => {
  return (
    <Box maxW="7xl" mx={'auto'} pt={5} px={{ base: 2, sm: 12, md: 17 }}>
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={{ base: 5, lg: 8 }}>
        <StatCard
          title={"Today's Money"}
          stat={'$53,000'}
          icon={FiDollarSign}
          change={55}
        />
        <StatCard
          title={"Today's Users"}
          stat={'2,300'}
          icon={FiUsers}
          change={5}
        />
        <StatCard
          title={'New Clients'}
          stat={'3,052'}
          icon={FiUserPlus}
          change={-14}
        />
        <StatCard
          title={'Total Sales'}
          stat={'$173,000'}
          icon={FiShoppingCart}
          change={8}
        />
      </SimpleGrid>

      <Box mt={8}>
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Sales Overview
        </Text>
        {/* Ensure SalesChart runs only on the client side */}
        <SalesChart />
      </Box>
    </Box>
  );
};

export default Dashboard;
