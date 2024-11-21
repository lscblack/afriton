import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, HomeIcon } from 'lucide-react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    title: "Reset Your Password",
    description: "Securely reset your password and regain access to your account",
    image: "https://quittogether.co.uk/wp-content/themes/quittogether/img/quit-together-animation-no-background.gif"
  },
  {
    title: "Secure & Private",
    description: "Your security is our top priority. We ensure a safe password reset process",
    image: "https://mir-s3-cdn-cf.behance.net/project_modules/fs/6b8a0699093857.5eeafdd995e46.gif"
  },
  {
    title: "24/7 Support",
    description: "Need help? Our support team is always here to assist you",
    image: "https://media.licdn.com/dms/image/v2/D5622AQG7o0kBxmSPzA/feedshare-shrink_2048_1536/feedshare-shrink_2048_1536/0/1686810302630?e=2147483647&v=beta&t=aDxkx--s5gJW9kBj1tLYV7_xTo-WrAYcRyxSbGJFSI8"
  }
];

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [apiToken, setApiToken] = useState(localStorage.getItem('apiToken') || '');
  const [email, setEmail] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(true);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [verificationCode, setVerificationCode] = useState(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(600);
  const otpInputRefs = Array(6).fill(0).map(() => React.createRef());
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Get API token if not exists
  useEffect(() => {
    const getAccessToken = async () => {
      try {
        if (apiToken) return;

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/access-token?username=${import.meta.env.VITE_AFRITON_FRONT_USERNAME}&password=${import.meta.env.VITE_AFRITON_FRONT_PASSWORD}`
        );

        if (response.data.token) {
          localStorage.setItem('apiToken', response.data.token);
          setApiToken(response.data.token);
        }
      } catch (error) {
        toast.error('Failed to initialize application');
      }
    };

    getAccessToken();
  }, [apiToken]);

  // Countdown timer
  useEffect(() => {
    let timer;
    if (showOtpForm && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showOtpForm, countdown]);

  const handleSendOtp = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsEmailSending(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/send-otp`,
        {
          purpose: "reset",
          toEmail: email
        },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`
          }
        }
      );

      if (response.data.verification_Code) {
        setVerificationCode(response.data.verification_Code);
        setShowEmailForm(false);
        setShowOtpForm(true);
        setCountdown(600);
        toast.success('Reset code sent to your email');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send reset code');
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleOtpVerification = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete verification code');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/verify-otp`,
        {
          otp_code: otpString.toString(),
          verification_code: verificationCode.toString(),
          email: email,
          purpose: "reset"
        },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`
          }
        }
      );

      if (response.data.detail === "Successfully Verified") {
        setShowOtpForm(false);
        setShowPasswordForm(true);
        toast.success('Email verified. Please set your new password');
      }
    } catch (error) {
      console.log('OTP Verification Error:', error.response?.data);
      let errorMessage = 'Invalid verification code';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      toast.error(errorMessage);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsResettingPassword(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/reset-password?email=${email}&new_password=${newPassword}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${apiToken}`
          }
        }
      );

      if (response.data.message) {
        toast.success('Password reset successfully');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      let errorMessage = 'Failed to reset password';
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => err.msg).join(', ');
        } else {
          errorMessage = error.response.data.detail;
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const otpArray = value.slice(0, 6).split('');
      const newOtp = [...otp];
      otpArray.forEach((digit, idx) => {
        if (idx + index < 6) {
          newOtp[idx + index] = digit;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + otpArray.length, 5);
      otpInputRefs[nextIndex].current?.focus();
    } else {
      // Handle single digit
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        otpInputRefs[index + 1].current?.focus();
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4 max-md:p-0">
      <div className="w-full max-w-7xl h-full bg-white rounded-2xl shadow-2xl flex overflow-hidden">
        {/* Left Side - Reset Form */}
        <div className="w-full lg:w-1/2 p-6 md:p-12 xl:p-16 flex flex-col">
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-16">
              <div className="bg-amber-500 text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold">A</div>
              <span className="text-2xl font-bold text-gray-800">friton</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-bold text-gray-800 mb-3">Reset Password</h1>
            <p className="text-gray-600 text-lg flex gap-3 items-center">
              Reset your password to continue
              <a href="/" className='text-blue-600 text-sm flex items-center' rel="noopener noreferrer">
                <HomeIcon size={12}/> Home
              </a>
            </p>
          </div>

          {showEmailForm && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-12 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <button
                onClick={handleSendOtp}
                disabled={isEmailSending}
                className="w-full bg-amber-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                {isEmailSending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : (
                  'Send Reset Code'
                )}
              </button>
            </div>
          )}

          {showOtpForm && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Enter the verification code sent to your email
                </p>
                {countdown > 0 ? (
                  <p className="text-xs text-gray-500">
                    Time remaining: {Math.floor(countdown / 60)}:
                    {(countdown % 60).toString().padStart(2, '0')}
                  </p>
                ) : (
                  <button
                    onClick={() => {
                      setCountdown(600);
                      handleSendOtp();
                    }}
                    className="text-amber-500 hover:text-amber-600 text-sm font-medium"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={otpInputRefs[index]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    className="w-12 h-12 text-center border-2 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
                  />
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowOtpForm(false);
                    setShowEmailForm(true);
                  }}
                  className="w-1/2 bg-gray-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-gray-600"
                >
                  Back
                </button>
                <button
                  onClick={handleOtpVerification}
                  disabled={isVerifyingOtp}
                  className="w-1/2 bg-amber-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-amber-600 disabled:opacity-50"
                >
                  {isVerifyingOtp ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>
            </div>
          )}

          {showPasswordForm && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-12 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-12 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setShowOtpForm(true);
                  }}
                  className="w-1/2 bg-gray-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-gray-600"
                >
                  Back
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={isResettingPassword}
                  className="w-1/2 bg-amber-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-amber-600 disabled:opacity-50"
                >
                  {isResettingPassword ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                      Resetting...
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <a href="/login" className="text-amber-500 hover:text-amber-600 font-medium">
              Back to Login
            </a>
          </div>
        </div>

        {/* Right Side - Sliding Content */}
        <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-amber-400 to-amber-600 p-12 xl:p-16 text-white relative overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 p-12 xl:p-16 xl:pt-0 transition-opacity duration-500 ease-in-out flex flex-col justify-center
                ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="mb-12 rounded-xl w-full h-ful"
              />
              <div className="max-w-lg">
                <h2 className="text-4xl xl:text-5xl font-bold mb-6">{slide.title}</h2>
                <p className="text-xl opacity-90">{slide.description}</p>
              </div>
            </div>
          ))}

          {/* Dots Navigation */}
          <div className="absolute bottom-12 xl:bottom-16 left-12 xl:left-16 flex gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 
                  ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ForgotPassword; 