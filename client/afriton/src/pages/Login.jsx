import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, HomeIcon } from 'lucide-react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useApp } from '../context/AppContext';

const LoginForm = () => {
  const navigate = useNavigate();
  const { setUserData } = useApp();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [apiToken, setApiToken] = useState(localStorage.getItem('apiToken') || '');
  const [googleInitialized, setGoogleInitialized] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const otpInputRefs = Array(6).fill(0).map(() => React.createRef());
  const [show2FAOptions, setShow2FAOptions] = useState(false);
  const [userId, setUserId] = useState(null);
  const [verificationCode, setVerificationCode] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [showOtpButton, setShowOtpButton] = useState(false);
  const [loginData, setLoginData] = useState(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);

  const slides = [
    {
      title: "Connect with every application",
      description: "Everything you need in an easily customizable dashboard",
      image: "https://quittogether.co.uk/wp-content/themes/quittogether/img/quit-together-animation-no-background.gif"
    },
    {
      title: "Powerful Analytics Tools",
      description: "Get insights into your business performance",
      image: "https://mir-s3-cdn-cf.behance.net/project_modules/fs/6b8a0699093857.5eeafdd995e46.gif"
    },
    {
      title: "Seamless Integration",
      description: "Connect with your favorite tools and services",
      image: "https://media.licdn.com/dms/image/v2/D5622AQG7o0kBxmSPzA/feedshare-shrink_2048_1536/feedshare-shrink_2048_1536/0/1686810302630?e=2147483647&v=beta&t=aDxkx--s5gJW9kBj1tLYV7_xTo-WrAYcRyxSbGJFSI8"
    }
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const getAccessToken = async () => {
      try {
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

  useEffect(() => {
    let timer;
    if (showOtpForm && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showOtpForm, countdown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!apiToken || !formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const loginResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          username: formData.email,
          password: formData.password
        },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`
          }
        }
      );

      if (loginResponse.data) {
        setLoginData(loginResponse.data);
        setShowLoginForm(false);
        setShowOtpButton(true);
        toast.success('Login successful! Please verify with OTP');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
      setShowLoginForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setIsOtpSending(true);
    try {
      const otpResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/send-otp`,
        {
          purpose: "login",
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
        setShowOtpButton(false);
        setShowOtpForm(true);
        setCountdown(600);
        toast.success('OTP sent to your email');
      }
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setIsOtpSending(false);
    }
  };

  const handleOtpVerification = async () => {
    setIsOtpVerifying(true);
    try {
      const otpString = otp.join('');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/verify-otp`,
        {
          otp_code: otpString,
          verification_code: verificationCode.toString(),
          email: formData.email,
          purpose: "login"
        },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`
          }
        }
      );

      if (response.data.detail === "Successfully Verified" && loginData) {
        // Store the token
        localStorage.setItem('token', loginData.access_token);
        // Store user data
        localStorage.setItem('userInfo', JSON.stringify(loginData));
        // Update context
        setUserData(loginData.user);
        
        toast.success('Login successful!');
        window.location.href= '/dashboard';
        console.log(loginData)
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Invalid OTP';
      toast.error(errorMessage);
    } finally {
      setIsOtpVerifying(false);
    }
  };

  const handle2FAMethod = async (method) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/send-otp`,
        {
          method,
          user_id: userId,
          purpose: "login",
          email: formData.email
        },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`
          }
        }
      );

      if (response.data.success) {
        setShowOtpForm(true);
        setCountdown(600);
        toast.success(`Verification code sent via ${method}`);
      }
    } catch (error) {
      toast.error('Failed to send verification code');
    }
  };


  const handleGoogleResponse = async (response) => {
    try {
      if (!apiToken) {
        toast.error('Application not properly initialized');
        return;
      }
      setIsGoogleLoading(true);

      const userObj = jwtDecode(response.credential);
      const googleResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/google-auth-token?Email=${userObj.email}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${apiToken}`
          }
        }
      );

      if (googleResponse.data) {
        // Store auth data
        localStorage.setItem('token', googleResponse.data.access_token);
        localStorage.setItem('userInfo', JSON.stringify(googleResponse.data));
        // Update context
        setUserData(googleResponse.data.user);
        
        toast.success('Login successful!');
        window.location.href= '/dashboard';
        // console.log(googleResponse.data)
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to authenticate with Google';
      toast.error(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };
  useEffect(() => {
    const initializeGoogleAuth = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID,
          callback: handleGoogleResponse,
          ux_mode: 'popup', // Use redirect mode
          // redirect_uri: window.location.origin + '/login', // Adjust dynamically for prod/dev
        });
        // Render the button
        window.google.accounts.id.renderButton(
          document.getElementById('signInDiv'),
          {
            theme: 'outline',
            size: 'large',
          }
        );
      }
    };

    const checkGoogleResponse = () => {
      const params = new URLSearchParams(window.location.search);
      const credential = params.get('credential'); // Extract the token from query params

      if (credential) {
        handleGoogleResponse({ credential }); // Call your handler with the token
        window.location.href= '/dashboard'; // Redirect to the dashboard programmatically
      }
    };

    // Run the initialization and response check
    initializeGoogleAuth();
    checkGoogleResponse();
  }, [navigate]);



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
      // Focus last input or next empty input
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

  const handleLoginSuccess = (response) => {
    if (response.data) {
      // Store token
      localStorage.setItem('token', response.data.access_token);
      // Store user data
      const userData = response.data.user;
      localStorage.setItem('userInfo', JSON.stringify(userData));
      // Update context
      setUserData(userData);
      
      toast.success('Login successful!');
      window.location.href= '/dashboard';
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4 max-md:p-0">
      <div className="w-full max-w-7xl h-full bg-white rounded-2xl shadow-2xl flex overflow-hidden">
        <div className="w-full lg:w-1/2 p-6 md:p-12 xl:p-16 flex flex-col">
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-16">
              <div className="bg-amber-500 text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold">A</div>
              <span className="text-2xl font-bold text-gray-800">friton</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-bold text-gray-800 mb-3">Welcome Back!</h1>
            <p className="text-gray-600 text-lg flex gap-3 items-center">
              Please sign in to continue
              <a href="/" className='text-blue-600 text-sm flex items-center' rel="noopener noreferrer">
                <HomeIcon size={12} /> Home
              </a>
            </p>
          </div>

          <div className="space-y-6 flex-grow">
            <div className="flex gap-4 items-center">
              <div className='w-full border-r-2 rounded-lg border-gray-200 overflow-hidden'>
                <div id="signInDiv" className={`w-full rounded-xl bg-[hsl(210,33%,99%)] ${isGoogleLoading ? 'opacity-50' : ''}`}></div>
              </div>
              {/* <button className="flex w-full items-center justify-center gap-3 p-2 border border-gray-300 max-md:p-2 max-md:text-xs rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-gray-600 font-medium"><span className="max-md:hidden">Sign in with</span> Facebook</span>
              </button> */}
            </div>

            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400">or continue with email</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {showLoginForm && (
              <div className="space-y-6">
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
                      className="w-full px-12 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="name@company.com"
                    />
                  </div>
                </div>

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
                      className="w-full px-12 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Enter your password"
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

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="w-5 h-5 rounded-md border-2 text-amber-500 focus:ring-amber-500" />
                    <span className="ml-2 text-gray-600">Remember me</span>
                  </label>
                  <a 
                    href="/forgot-password" 
                    className="text-amber-500 hover:text-amber-600 font-medium"
                  >
                    Forgot Password?
                  </a>
                </div>

                {show2FAOptions && !showOtpForm && (
                  <div className="space-y-4">
                    <p className="text-center text-gray-600">Choose verification method:</p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => handle2FAMethod('email')}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                      >
                        Email OTP
                      </button>
                      <button
                        onClick={() => handle2FAMethod('google_authenticator')}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                      >
                        Google Authenticator
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-amber-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>

                <p className="text-center text-gray-600">
                  Don't have an account?{' '}
                  <a href="/register" className="text-amber-500 hover:text-amber-600 font-medium">
                    Create an account
                  </a>
                </p>
              </div>
            )}

            {showOtpButton && (
              <div className="text-center space-y-4">
                <p className="text-gray-600">Click below to receive verification code</p>
                <button
                  onClick={handleSendOtp}
                  disabled={isOtpSending}
                  className="w-full bg-amber-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-amber-600 disabled:opacity-50"
                >
                  {isOtpSending ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                      Sending OTP...
                    </div>
                  ) : (
                    'Get OTP on Email'
                  )}
                </button>
              </div>
            )}

            {showOtpForm && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Enter the verification code sent to your email</p>
                  <p className="text-xs text-gray-500">
                    Time remaining: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                  </p>
                </div>
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={otpInputRefs[index]}
                      type="text"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && index > 0) {
                          otpInputRefs[index - 1].current?.focus();
                        }
                      }}
                      className="w-12 h-12 text-center border-2 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
                    />
                  ))}
                </div>
                <button
                  onClick={handleOtpVerification}
                  disabled={isOtpVerifying}
                  className="w-full bg-amber-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-amber-600 disabled:opacity-50"
                >
                  {isOtpVerifying ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

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
      />
    </div>
  );
};

export default LoginForm;