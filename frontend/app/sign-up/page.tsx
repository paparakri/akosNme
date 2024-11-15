"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Mail, Lock, Phone, Calendar, ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { signInNormalUser } from "../lib/authHelper";

interface SignUpFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confPassword: string;
  phoneNumber: string;
  dateOfBirth: string;
}

interface FormErrors {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confPassword: string;
  phoneNumber: string;
  dateOfBirth: string;
}

const SignUpPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confPassword: "",
    phoneNumber: "",
    dateOfBirth: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confPassword: "",
    phoneNumber: "",
    dateOfBirth: "",
  });

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: FormErrors = {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confPassword: "",
      phoneNumber: "",
      dateOfBirth: "",
    };

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
      isValid = false;
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      isValid = false;
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
      isValid = false;
    }

    // Date of Birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
      isValid = false;
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.dateOfBirth = "You must be at least 18 years old";
        isValid = false;
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    // Confirm Password validation
    if (!formData.confPassword) {
      newErrors.confPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confPassword) {
      newErrors.confPassword = "Passwords do not match";
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
      await signInNormalUser(formData);
      router.push("/sign-in");
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderInputField = (
    name: keyof SignUpFormData,
    label: string,
    type: string,
    placeholder: string,
    icon: React.ReactNode,
    showToggle?: boolean
  ) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <div className="relative">
        <input
          type={showToggle ? (showPassword ? "text" : "password") : type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={`w-full bg-gray-700/50 border ${
            errors[name] ? 'border-red-500' : 'border-gray-600'
          } rounded-lg px-4 py-2.5 pl-10 ${
            showToggle ? 'pr-10' : ''
          } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200`}
          placeholder={placeholder}
          disabled={isLoading}
        />
        <span className="absolute left-3 top-3 text-gray-400">{icon}</span>
        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-300 focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {errors[name] && (
        <span className="text-sm text-red-500">{errors[name]}</span>
      )}
    </div>
  );

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
      <div className="container mx-auto px-4 pt-8 pb-32">
        <div className="max-w-2xl mx-auto">
          {/* Animated Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Create Your Account
            </h1>
            <p className="text-gray-400 mt-2">Join the vibrant nightlife community</p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInputField("firstName", "First Name", "text", "John", <User className="w-5 h-5" />)}
                {renderInputField("lastName", "Last Name", "text", "Doe", <User className="w-5 h-5" />)}
              </div>

              {/* Username and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInputField("username", "Username", "text", "johndoe", <User className="w-5 h-5" />)}
                {renderInputField("email", "Email", "email", "john@example.com", <Mail className="w-5 h-5" />)}
              </div>

              {/* Phone and Date of Birth */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInputField("phoneNumber", "Phone Number", "tel", "+30 123-456-7890", <Phone className="w-5 h-5" />)}
                {renderInputField("dateOfBirth", "Date of Birth", "date", "", <Calendar className="w-5 h-5" />)}
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInputField("password", "Password", "password", "••••••••", <Lock className="w-5 h-5" />, true)}
                {renderInputField("confPassword", "Confirm Password", "password", "••••••••", <Lock className="w-5 h-5" />, true)}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg 
                         py-3 font-medium hover:from-blue-600 hover:to-purple-600 
                         focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800
                         transform transition-all duration-200 hover:scale-[1.02]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Create Account</span>
                  </>
                )}
              </button>

              {/* Sign In Link */}
              <p className="text-center text-gray-400">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Sign in here
                </Link>
              </p>
            </form>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 text-center"
          >
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                <span>Instant Access</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                <span>Exclusive Offers</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                <span>Priority Bookings</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;