import React, { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, Mail, Lock, User, HomeIcon, UserCircle2, User2, Users } from 'lucide-react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { debounce } from 'lodash';

const slides = [
  {
    title: "Join our community today",
    description: "Create an account to access all features and start your journey",
    image: "https://quittogether.co.uk/wp-content/themes/quittogether/img/quit-together-animation-no-background.gif"
  },
  {
    title: "Secure & Private",
    description: "Your data is protected with enterprise-grade security",
    image: "https://mir-s3-cdn-cf.behance.net/project_modules/fs/6b8a0699093857.5eeafdd995e46.gif"
  },
  {
    title: "24/7 Support",
    description: "Our support team is always here to help you",
    image: "https://media.licdn.com/dms/image/v2/D5622AQG7o0kBxmSPzA/feedshare-shrink_2048_1536/feedshare-shrink_2048_1536/0/1686810302630?e=2147483647&v=beta&t=aDxkx--s5gJW9kBj1tLYV7_xTo-WrAYcRyxSbGJFSI8"
  }
];

const phoneInputCustomStyles = {
  container: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: '54px',
    fontSize: '16px',
    paddingLeft: '100px',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    backgroundColor: 'white',
  },
  button: {
    border: 'none',
    borderRadius: '12px 0 0 12px',
    backgroundColor: 'transparent',
    padding: '0 16px',
    height: '54px',
    minWidth: '90px',
  }
};

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [apiToken, setApiToken] = useState(localStorage.getItem('apiToken') || '');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    phone: '',
    avatar: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [showRegistrationButton, setShowRegistrationButton] = useState(false);
  const [verificationCode, setVerificationCode] = useState(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(600);
  const otpInputRefs = Array(6).fill(0).map(() => React.createRef());
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(true);
  const [isGoogleRegistering, setIsGoogleRegistering] = useState(false);

  // Get API token on component mount
  useEffect(() => {
    const getAccessToken = async () => {
      try {
        // If we already have a token, no need to fetch
        if (apiToken) {
          return;
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/access-token?username=${import.meta.env.VITE_AFRITON_FRONT_USERNAME}&password=${import.meta.env.VITE_AFRITON_FRONT_PASSWORD}`,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.token) {
          localStorage.setItem('apiToken', response.data.token);
          setApiToken(response.data.token);
        }
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.message || 
                           'Failed to initialize application';
        toast.error(errorMessage);
      }
    };

    getAccessToken();
  }, [apiToken]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle Google registration
  const handleGoogleResponse = async (response) => {
    try {
      if (!apiToken) {
        toast.error('Application not properly initialized');
        return;
      }
      setIsGoogleRegistering(true);

      const userObj = jwtDecode(response.credential);
      const googleResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/google-auth`,
        {
            email: userObj.email,
            fname: userObj.given_name,
            lname: userObj.family_name,
            password: `Google_${Date.now()}`,
            gender: "",
            avatar: userObj.picture
        },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`
          }
        }
      );

      if (googleResponse.data) {
        // Store auth data and redirect to dashboard
        localStorage.setItem('token', googleResponse.data.access_token);
        localStorage.setItem('userData', googleResponse.data.encrypted_data);
        toast.success('Registration successful!');
        navigate('/dashboard');
      }
    } catch (error) {
      let errorMessage = 'Google signup failed';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      toast.error(errorMessage);
    } finally {
      setIsGoogleRegistering(false);
    }
  };


  useEffect(() => {
    const initializeGoogleAuth = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID,
          callback: handleGoogleResponse,
          ux_mode: 'popup', // Use popup mode
          // redirect_uri: 'https://afriton.netlify.app/dashboard', // production
          // redirect_uri: 'http://localhost:5173/dashboard', // development
        });
        // Render the button
        window.google.accounts.id.renderButton(
          document.getElementById('signInDiv'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%', // Ensures responsiveness
          }
        );
      }
    };

    // Add a small delay to ensure the DOM is fully loaded
    const timeoutId = setTimeout(initializeGoogleAuth, 100);
    return () => clearTimeout(timeoutId);
  }, []);


  // Add form validation functions
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.fname) newErrors.fname = 'First name is required';
    if (!formData.lname) newErrors.lname = 'Last name is required';
    return newErrors;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    return newErrors;
  };

  // Add navigation functions
  const handleNext = () => {
    let stepErrors = {};
    switch (currentStep) {
      case 1:
        stepErrors = validateStep1();
        break;
      case 2:
        stepErrors = validateStep2();
        break;
      case 3:
        stepErrors = validateStep3();
        break;
    }

    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Add OTP validation function
  const isOtpComplete = () => {
    return otp.every(digit => digit !== '');
  };

  // Modify handleOtpVerification function
  const handleOtpVerification = async () => {
    if (!isOtpComplete()) {
      toast.error('Please enter the complete verification code');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const otpString = otp.join('');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/verify-otp`,
        {
          otp_code: otpString,
          verification_code: verificationCode.toString(),
          email: formData.email,
          purpose: "email"
        },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`
          }
        }
      );

      if (response.data.detail === "Successfully Verified") {
        toast.success('Email verified successfully!');
        // After successful verification, register the user
        await handleRegistration();
      }
    } catch (error) {
      let errorMessage = 'Invalid verification code';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      toast.error(errorMessage);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Modify handleRegistration function
  const handleRegistration = async () => {
    setIsCreatingAccount(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          fname: formData.fname,
          lname: formData.lname,
          email: formData.email,
          password: formData.password,
          gender: formData.gender,
          phone: formData.phone,
          avatar: formData.avatar
        },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`
          }
        }
      );

      if (response.data?.message) {
        toast.success('Account created successfully! Please login.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      let errorMessage = 'Registration failed';
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          // Handle validation errors
          errorMessage = error.response.data.detail.map(err => err.msg).join(', ');
        }
      }
      toast.error(errorMessage);
      // If registration fails, allow user to try again
      setShowOtpForm(false);
      setShowRegisterForm(true);
    } finally {
      // setIsCreatingAccount(false);
    }
  };

  // Add handleSendOtp function
  const handleSendOtp = async () => {
    if (!apiToken) {
      toast.error('Application not properly initialized');
      return;
    }

    setIsVerifyingEmail(true);
    try {
      const otpResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/send-otp`,
        {
          purpose: "email",
          toEmail: formData.email
        },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`
          }
        }
      );

      if (otpResponse.data.verification_Code) {
        setVerificationCode(otpResponse.data.verification_Code);
        setShowOtpForm(true);
        setShowRegisterForm(false); // Hide register form
        setCountdown(600);
        toast.success('Verification code sent to your email');
      }
    } catch (error) {
      let errorMessage = 'Failed to send verification code';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      toast.error(errorMessage);
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  // Add handleOtpChange function
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    const sanitizedValue = value.replace(/[^0-9]/g, '');
    
    if (sanitizedValue.length > 1) {
      // Handle paste
      const otpArray = sanitizedValue.slice(0, 6).split('');
      const newOtp = [...otp];
      otpArray.forEach((digit, idx) => {
        if (idx + index < 6) {
          newOtp[idx + index] = digit;
        }
      });
      setOtp(newOtp);
      
      // Focus last input or next empty input
      const nextIndex = Math.min(index + otpArray.length, 5);
      otpInputRefs[nextIndex].current?.focus();
    } else {
      // Handle single digit
      const newOtp = [...otp];
      newOtp[index] = sanitizedValue;
      setOtp(newOtp);
      
      if (sanitizedValue && index < 5) {
        otpInputRefs[index + 1].current?.focus();
      }
    }
  };

  // Add debounce to prevent multiple rapid requests
  const debouncedSendOtp = useCallback(
    debounce(() => {
      handleSendOtp();
    }, 1000),
    []
  );

  // Add debounce to prevent multiple rapid OTP verifications
  const debouncedVerifyOtp = useCallback(
    debounce(() => {
      handleOtpVerification();
    }, 1000),
    []
  );

  // Add countdown timer effect
  useEffect(() => {
    let timer;
    if (showOtpForm && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showOtpForm, countdown]);

  // Your existing JSX with updated form handling
  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4 max-md:p-0">
      <div className="w-full max-w-7xl h-full bg-white rounded-2xl shadow-2xl flex overflow-hidden">
        {/* Left Side - Registration Form */}
        <div className="w-full lg:w-1/2 p-6 md:p-12 xl:p-16 flex flex-col">
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-16">
              <div className="bg-amber-500 text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold">A</div>
              <span className="text-2xl font-bold text-gray-800">friton</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-bold text-gray-800 mb-3">Create Account</h1>
            <p className="text-gray-600 text-lg flex gap-3 items-center">Register to get started <a href="/" className='text-blue-600 text-sm flex items-center' rel="noopener noreferrer"><HomeIcon size={12}/> Home</a></p>
          </div>  

          <div className="space-y-6 flex-grow">
            {/* Social Registration Buttons */}
            <div className="flex gap-4 items-center">
              <div className='w-full border-r-2 rounded-lg border-gray-200 overflow-hidden'>
                <div id="signInDiv" className="w-full rounded-xl bg-[hsl(210,33%,99%)]"></div>
              </div>
              <button className="flex w-full items-center justify-center gap-3 p-2 border border-gray-300 max-md:p-2 max-md:text-xs rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-gray-600 font-medium"><span className="max-md:hidden">Sign in with</span> Facebook</span>
              </button>
            </div>

            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400">or register with email</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Replace the existing form fields with this stepped form */}
            <form className="space-y-6">
              {showRegisterForm && (
                <>
                  {currentStep === 1 && (
                    <>
                      {/* Email Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Mail size={20} />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full px-12 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                              errors.email ? 'border-red-500' : ''
                            }`}
                            placeholder="name@company.com"
                          />
                        </div>
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>

                      {/* Password Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Lock size={20} />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`w-full px-12 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                              errors.password ? 'border-red-500' : ''
                            }`}
                            placeholder="Create a strong password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                      </div>

                      {/* Confirm Password Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Lock size={20} />
                          </div>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className={`w-full px-12 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                              errors.confirmPassword ? 'border-red-500' : ''
                            }`}
                            placeholder="Confirm your password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                      </div>

                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={handleNext}
                          className="w-full bg-amber-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-amber-600 transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </>
                  )}

                  {currentStep === 2 && (
                    <>
                      {/* First Name Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <User size={20} />
                          </div>
                          <input
                            type="text"
                            name="fname"
                            value={formData.fname}
                            onChange={handleInputChange}
                            className={`w-full px-12 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                              errors.fname ? 'border-red-500' : ''
                            }`}
                            placeholder="John"
                          />
                        </div>
                        {errors.fname && <p className="text-red-500 text-sm mt-1">{errors.fname}</p>}
                      </div>

                      {/* Last Name Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <User size={20} />
                          </div>
                          <input
                            type="text"
                            name="lname"
                            value={formData.lname}
                            onChange={handleInputChange}
                            className={`w-full px-12 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                              errors.lname ? 'border-red-500' : ''
                            }`}
                            placeholder="Doe"
                          />
                        </div>
                        {errors.lname && <p className="text-red-500 text-sm mt-1">{errors.lname}</p>}
                      </div>

                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={handlePrevious}
                          className="w-1/2 bg-gray-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-gray-600 transition-colors"
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          onClick={handleNext}
                          className="w-1/2 bg-amber-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-amber-600 transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </>
                  )}

                  {currentStep === 3 && !showOtpForm && (
                    <>
                      {/* Gender Select */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {formData.gender === 'male' ? (
                              <UserCircle2 size={20} />
                            ) : formData.gender === 'female' ? (
                              <User2 size={20} />
                            ) : (
                              <Users size={20} />
                            )}
                          </div>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className={`w-full px-12 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white ${
                              errors.gender ? 'border-red-500' : ''
                            }`}
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                      </div>

                      {/* Phone Input with Country Code */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <div className="relative">
                          <PhoneInput
                            country={'us'}
                            value={formData.phone}
                            onChange={(phone) => {
                              setFormData(prev => ({
                                ...prev,
                                phone: phone
                              }));
                            }}
                            inputProps={{
                              name: 'phone',
                              required: true,
                              className: `${errors.phone ? 'border-red-500' : ''} focus:ring-2 focus:ring-amber-500 focus:border-transparent`
                            }}
                            containerClass="phone-input-container"
                            containerStyle={phoneInputCustomStyles.container}
                            inputStyle={phoneInputCustomStyles.input}
                            buttonStyle={phoneInputCustomStyles.button}
                            buttonClass="phone-input-flag-button"
                            dropdownStyle={{ 
                              width: 'max-content',
                              borderRadius: '8px',
                              marginTop: '4px'
                            }}
                          />
                        </div>
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                      </div>

                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={handlePrevious}
                          className="w-1/2 bg-gray-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-gray-600 transition-colors"
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isVerifyingEmail}
                          className="w-1/2 bg-amber-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50"
                        >
                          {isVerifyingEmail ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                              Sending...
                            </div>
                          ) : (
                            'Verify Email'
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}

              {showOtpForm && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Enter the verification code sent to your email</p>
                    {countdown > 0 ? (
                      <p className="text-xs text-gray-500">
                        Time remaining: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
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
                      type="button"
                      onClick={() => {
                        setShowOtpForm(false);
                        setShowRegisterForm(true);
                      }}
                      className="w-1/2 bg-gray-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-gray-600 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleOtpVerification}
                      disabled={!isOtpComplete() || isVerifyingOtp || isCreatingAccount}
                      className="w-1/2 bg-amber-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50"
                    >
                      {isVerifyingOtp ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                          Verifying...
                        </div>
                      ) : isCreatingAccount ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                          Creating Account...
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Sign In Link */}
            <p className="text-center text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-amber-500 hover:text-amber-600 font-medium">Sign in</a>
            </p>
          </div>
        </div>

        {/* Right Side - Sliding Content */}
        <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-amber-400 to-amber-600 p-12 xl:p-16 text-white relative overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 p-12 xl:p-16 transition-opacity duration-500 ease-in-out flex flex-col justify-center
                ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            >
              <div className="max-w-lg">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="mb-12 rounded-xl shadow-lg"
                />
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
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default Register;