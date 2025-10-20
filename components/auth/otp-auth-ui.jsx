import React, { useState, useEffect } from 'react';
import { Mail, Phone, Lock, CheckCircle, ArrowLeft, Timer, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SiteLogo } from "@/components/svg";

const AuthUI = () => {
  const [authMode, setAuthMode] = useState('login'); // 'login', 'otp', 'otp-verify', 'success'
  const [contactType, setContactType] = useState('email');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    contact: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Generate random OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Validate email
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validate phone
  const isValidPhone = (phone) => {
    return /^[+]?[\d\s-()]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  // Handle traditional login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Simulate login success
      setAuthMode('success');
      setIsLoading(false);
    }, 1500);
  };

  // Handle OTP login flow
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.contact) {
      setError('Please enter your contact information');
      return;
    }

    if (contactType === 'email' && !isValidEmail(formData.contact)) {
      setError('Please enter a valid email address');
      return;
    }

    if (contactType === 'phone' && !isValidPhone(formData.contact)) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const newOTP = generateOTP();
      setGeneratedOTP(newOTP);
      console.log(`OTP sent to ${formData.contact}: ${newOTP}`);
      setAuthMode('otp-verify');
      setCountdown(60);
      setIsLoading(false);
    }, 1500);
  };

  // Handle OTP input
  const handleOTPChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  // Handle paste events
  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');

    // Check if pasted data contains only digits and is 6 characters long
    if (/^\d{6}$/.test(pastedData)) {
      const newOTP = pastedData.split('');
      setOtp(newOTP);

      // Focus the last input field after pasting
      setTimeout(() => {
        document.getElementById('otp-5').focus();
      }, 0);
    } else if (/^\d+$/.test(pastedData) && pastedData.length <= 6) {
      // If it's digits but less than 6, fill from current position
      const currentIndex = parseInt(e.target.id.split('-')[1]);
      const newOTP = [...otp];
      const digits = pastedData.split('');

      for (let i = 0; i < digits.length && (currentIndex + i) < 6; i++) {
        newOTP[currentIndex + i] = digits[i];
      }

      setOtp(newOTP);

      // Focus the next empty field or last field
      const nextIndex = Math.min(currentIndex + digits.length, 5);
      setTimeout(() => {
        document.getElementById(`otp-${nextIndex}`).focus();
      }, 0);
    }
  };

  // Handle keydown events for OTP inputs
  const handleOTPKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      const newOTP = [...otp];

      if (newOTP[index]) {
        // If current field has value, clear it
        newOTP[index] = '';
        setOtp(newOTP);
      } else if (index > 0) {
        // If current field is empty, move to previous field and clear it
        newOTP[index - 1] = '';
        setOtp(newOTP);
        document.getElementById(`otp-${index - 1}`).focus();
      }

      e.preventDefault();
    }

    // Handle arrow keys for navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }

    if (e.key === 'ArrowRight' && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    const enteredOTP = otp.join('');

    if (enteredOTP.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (enteredOTP === generatedOTP) {
        setAuthMode('success');
      } else {
        setError('Invalid OTP. Please try again.');
      }
      setIsLoading(false);
    }, 1000);
  };

  // Handle resend OTP
  const handleResendOTP = () => {
    if (countdown > 0) return;

    const newOTP = generateOTP();
    setGeneratedOTP(newOTP);
    console.log(`OTP resent to ${formData.contact}: ${newOTP}`);
    setCountdown(60);
    setOtp(['', '', '', '', '', '']);
    setError('');
  };

  // Reset form
  const handleReset = () => {
    setAuthMode('login');
    setFormData({ email: '', password: '', contact: '' });
    setOtp(['', '', '', '', '', '']);
    setError('');
    setCountdown(0);
    setGeneratedOTP('');
  };

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white rounded-2xl  w-full">
        <div className="w-full gap-y-2">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link href="/dashboard" className="inline-block">
                <SiteLogo className="h-25 w-25 3xl:w-14 3xl:h-14 text-primary" />
              </Link>
            </div>
            {authMode === 'otp-verify' && (
              <button
                onClick={() => setAuthMode('otp')}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}
          </div>

          <div className="2xl:text-3xl text-2xl font-bold text-gray-800 mb-2">
            {authMode === 'success' ? 'Welcome! 🎉' : 'Hey, Hello 👋'}
          </div>

          <div className="2xl:text-lg text-base text-gray-600 2xl:mt-2 leading-6 mb-6">
            {authMode === 'login' && 'Enter your login details to access your account.'}
            {authMode === 'otp' && 'Enter your contact details to receive OTP.'}
            {authMode === 'otp-verify' && `Enter the 6-digit code sent to ${formData.contact}`}
            {authMode === 'success' && 'You have successfully logged in to your account.'}
          </div>

          {/* Login Form */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block mb-2 font-medium text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block mb-2 font-medium text-gray-600">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Forgot Password?
                </button>
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#f78934] text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Login'
                )}
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('otp')}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors border border-gray-300"
              >
                Login with OTP
              </button>
            </form>
          )}

          {/* OTP Contact Form */}
          {authMode === 'otp' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              {/* Contact Type Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setContactType('email')}
                  className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all ${contactType === 'email'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setContactType('phone')}
                  className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all ${contactType === 'phone'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Phone
                </button>
              </div>

              <div>
                <label htmlFor="contact" className="block mb-2 font-medium text-gray-600">
                  {contactType === 'email' ? 'Email' : 'Phone Number'}
                </label>
                <input
                  type={contactType === 'email' ? 'email' : 'tel'}
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => handleInputChange('contact', e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder={contactType === 'email' ? 'Enter your email' : 'Enter your phone number'}
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#f78934] text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors border border-gray-300"
              >
                Back to Login
              </button>
            </form>
          )}

          {/* OTP Verification */}
          {authMode === 'otp-verify' && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {/* OTP Input */}
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleOTPKeyDown(index, e)}
                    onPaste={handleOTPPaste}
                    maxLength={1}
                    className="w-12 h-12 text-center text-lg font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                ))}
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg text-center">
                  {error}
                </div>
              )}

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={countdown > 0}
                  className="text-blue-600 hover:text-blue-800 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.join('').length !== 6}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>
            </form>
          )}

          {/* Success Screen */}
          {authMode === 'success' && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold">Login Successful</p>
                <p className="text-green-600 text-sm mt-1">
                  Redirecting to dashboard...
                </p>
              </div>

              <button
                onClick={handleReset}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Debug Info */}
        {authMode === 'otp-verify' && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-lg text-sm">
            <p>Debug: OTP is <strong>{generatedOTP}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthUI;