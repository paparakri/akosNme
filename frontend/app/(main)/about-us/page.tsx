"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Star, Music, Users, Clock, Globe, Award, ChevronDown, ArrowRight } from 'lucide-react';

const AboutUsPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { 
      icon: Star, 
      value: '50+', 
      label: 'Premium Venues',
      description: 'Exclusive partnerships with top clubs'
    },
    { 
      icon: Users, 
      value: '10K+', 
      label: 'Monthly Users',
      description: 'Trust us for their nightlife'
    },
    { 
      icon: Clock, 
      value: '24/7', 
      label: 'VIP Support',
      description: 'Always here to assist you'
    },
    { 
      icon: Globe, 
      value: '5+', 
      label: 'Major Cities',
      description: 'Expanding across Greece'
    }
  ];

  const features = [
    {
      icon: Music,
      title: "Premium Club Network",
      description: "Access the most prestigious venues with exclusive perks and priority entry.",
      color: "from-purple-500 to-indigo-600"
    },
    {
      icon: Users,
      title: "VIP Concierge",
      description: "Personal assistance for special requests and custom experiences.",
      color: "from-blue-500 to-pink-600"
    },
    {
      icon: Clock,
      title: "Real-Time Bookings",
      description: "Instant confirmations and seamless digital experience.",
      color: "from-green-500 to-teal-600"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section with Parallax */}
      <div ref={scrollRef} className="relative h-screen">
        <motion.div 
          style={{ y, opacity }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />
          <img
            src="/api/placeholder/1920/1080"
            alt="Nightclub atmosphere"
            className="w-full h-full object-cover"
          />
        </motion.div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-center space-y-8"
            >
              <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight leading-none">
                <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600 bg-clip-text text-transparent pb-2">
                  Redefining
                </span>
                <span className="block text-white pb-2">
                  Nightlife Excellence
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Experience the perfect blend of luxury, excitement, and convenience
                with Greece&apos;s premier nightlife booking platform.
              </p>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex justify-center gap-4"
              >
                <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-pink-600 rounded-full text-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105">
                  Explore Venues
                </button>
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-full text-lg font-semibold hover:bg-white/20 transition-all duration-300">
                  Learn More
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-sm text-gray-400">Scroll to discover</span>
          <ChevronDown className="w-6 h-6 text-white" />
        </motion.div>
      </div>

      {/* Stats Section with Gradient Cards */}
      <div className="relative py-32 bg-gradient-to-b from-black via-purple-900/20 to-black">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Setting the Gold Standard<br />in Nightlife Entertainment
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Our platform connects party-goers with the most exclusive venues,
              delivering unforgettable experiences night after night.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:border-blue-500/50 transition-colors duration-300">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl">
                      <stat.icon className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-4xl font-bold leading-none mb-2">{stat.value}</h3>
                    <div>
                      <p className="text-lg font-semibold mb-1">{stat.label}</p>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {stat.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section with Interactive Cards */}
      <div className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-20 rounded-2xl blur-xl group-hover:opacity-30 transition-opacity duration-300`} />
                <div className="relative bg-gray-900/60 backdrop-blur-sm p-8 rounded-2xl border border-white/10 group-hover:border-white/20 transition-colors duration-300">
                  <div className="mb-6">
                    <div className={`inline-block p-3 bg-gradient-to-r ${feature.color} rounded-xl`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-sm font-semibold text-white group-hover:text-blue-400 transition-colors duration-300">
                    Learn more
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-0 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;