"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import { loginNormalUser, loginClubUser } from "../../lib/authHelper";
import { useToast } from "@chakra-ui/react";
import { useAuth } from "../../lib/authContext";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email: string;
  password: string;
}

function SignInPage() {
  const router = useRouter();
  const { updateAuthStatus } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    password: "",
  });
  const toast = useToast();

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = {
      email: "",
      password: "",
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const data = {
        email: formData.email,
        password: formData.password
      };

      // Try logging in as normal user first
      try {
        const normalUserResponse = await loginNormalUser(data);
        if (normalUserResponse) {
          updateAuthStatus(true);
          toast({
            title: "Welcome back!",
            description: "Successfully signed in as a user",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          router.push('/');
          return;
        }
      } catch (error) {
        // If normal user login fails, try club login
        try {
          const clubUserResponse = await loginClubUser(data);
          if (clubUserResponse) {
            updateAuthStatus(true);
            toast({
              title: "Welcome back!",
              description: "Successfully signed in as a club",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
            router.push('/');
            return;
          }
        } catch (clubError) {
          throw new Error("Invalid email or password");
        }
      }
    } catch (error: any) {
      updateAuthStatus(false);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Navigation */}
      <nav className="p-4">
        <Link href="/" className="inline-flex items-center text-gray-300 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Back to Home</span>
        </Link>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-16 pb-32">
        <div className="max-w-md mx-auto">
          {/* Animated Logo/Brand */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-400 mt-2">Sign in to continue your journey</p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full bg-gray-700/50 border ${
                      errors.email ? 'border-red-500' : 'border-gray-600'
                    } rounded-lg px-4 py-2.5 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200`}
                    placeholder="your@email.com"
                    disabled={isLoading}
                  />
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                </div>
                {errors.email && (
                  <span className="text-sm text-red-500">{errors.email}</span>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full bg-gray-700/50 border ${
                      errors.password ? 'border-red-500' : 'border-gray-600'
                    } rounded-lg px-4 py-2.5 pl-10 pr-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200`}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-300 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-sm text-red-500">{errors.password}</span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg 
                         py-2.5 font-medium hover:from-blue-600 hover:to-purple-600 
                         focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800
                         transform transition-all duration-200 hover:scale-[1.02]
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Footer Links */}
              <div className="flex items-center justify-between text-sm">
                <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot password?
                </Link>
                <Link href="/sign-up" className="text-gray-400 hover:text-white transition-colors">
                  Need an account? Sign up
                </Link>
              </div>
            </form>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 text-center text-gray-400 text-sm"
          >
            <p>Join thousands of nightlife enthusiasts</p>
            <div className="flex justify-center space-x-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <div className="w-2 h-2 rounded-full bg-pink-500"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;