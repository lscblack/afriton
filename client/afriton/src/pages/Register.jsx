import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, HomeIcon, Phone, UserCircle2, User2, Users } from 'lucide-react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

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
  const [apiToken, setApiToken] = useState('');
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

  // Get API token on component mount
  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/access-token?username=${import.meta.env.VITE_AFRITON_FRONT_USERNAME}&password=${import.meta.env.VITE_AFRITON_FRONT_PASSWORD}`,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.token) {
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
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle manual registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!apiToken) {
      toast.error('Application not properly initialized');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
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

      if (response.data) {
        toast.success('Registration successful! Please check your email for verification.');
        navigate('/login');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Registration failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google registration
  const handleGoogleResponse = async (response) => {
    try {
      if (!apiToken) {
        toast.error('Application not properly initialized');
        return;
      }

      const userObj = jwtDecode(response.credential);
      
      const googleResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/google-auth`,
        {
          create_user_request: {
            email: userObj.email,
            fname: userObj.given_name,
            lname: userObj.family_name,
            password: `Google_${Date.now()}`,
            gender: ""
          },
          avatar: userObj.picture
        },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`
          }
        }
      );

      if (googleResponse.data) {
        localStorage.setItem('token', googleResponse.data.access_token);
        localStorage.setItem('userData', googleResponse.data.encrypted_data);
        toast.success('Registration successful!');
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Registration with Google failed';
      toast.error(errorMessage);
    }
  };

  // Initialize Google Sign-In
  useEffect(() => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('googleSignInDiv'),
        { theme: 'outline', size: 'large' }
      );
    }
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
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 p-3 border-2 rounded-xl max-md:p-2 max-md:text-xs hover:bg-gray-50 transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-gray-600 font-medium">Sign up with Google</span>
              </button>
              <button className="flex items-center justify-center gap-3 p-3 border-2 rounded-xl max-md:p-2 max-md:text-xs hover:bg-gray-50 transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-gray-600 font-medium">Sign up with Facebook</span>
              </button>
            </div>

            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400">or register with email</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Replace the existing form fields with this stepped form */}
            <form onSubmit={handleSubmit} className="space-y-6">
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
                </>
              )}

              {currentStep === 3 && (
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
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="w-full bg-gray-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Previous
                  </button>
                )}
                
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full bg-amber-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-amber-600 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                )}
              </div>
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
    </div>
  );
};

export default Register;