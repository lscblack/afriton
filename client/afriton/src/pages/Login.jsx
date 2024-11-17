import React from 'react';
import { Eye, EyeOff, Mail, Lock,HomeIcon } from 'lucide-react';

const LoginForm = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const slides = [
    {
      title: "Connect with every application",
      description: "Everything you need in an easily customizable dashboard",
      image: "/api/placeholder/400/300"
    },
    {
      title: "Powerful Analytics Tools",
      description: "Get insights into your business performance",
      image: "/api/placeholder/400/300"
    },
    {
      title: "Seamless Integration",
      description: "Connect with your favorite tools and services",
      image: "/api/placeholder/400/300"
    }
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4 max-md:p-0">
      <div className="w-full max-w-7xl h-full bg-white rounded-2xl shadow-2xl flex overflow-hidden">
        {/* Left Side - Login Form */}
        <div className="w-full lg:w-1/2 p-6 md:p-12 xl:p-16 flex flex-col">
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-16">
              <div className="bg-amber-500 text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold">A</div>
              <span className="text-2xl font-bold text-gray-800">friton</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-bold text-gray-800 mb-3">Welcome Back!</h1>
            <p className="text-gray-600 text-lg flex gap-3 items-center">Please sign in to continue <a href="/"  className='text-blue-600 text-sm flex items-center' rel="noopener noreferrer"><HomeIcon size={12}/> Home</a></p>
          </div>

          <div className="space-y-6 flex-grow">
            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 p-3 border-2 rounded-xl max-md:p-2 max-md:text-xs hover:bg-gray-50 transition-colors group">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-gray-600 font-medium">Sign in with Google</span>
              </button>
              <button className="flex items-center justify-center gap-3 p-3 border-2 max-md:p-2 max-md:text-xs rounded-xl hover:bg-gray-50 transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-gray-600 font-medium">Sign in with Facebook</span>
              </button>
            </div>

            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400">or continue with email</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  className="w-full px-12 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="name@company.com"
                />
              </div>
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
                  className="w-full px-12 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-5 h-5 rounded-md border-2 text-amber-500 focus:ring-amber-500" />
                <span className="ml-2 text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-amber-500 hover:text-amber-600 font-medium">Forgot Password?</a>
            </div>

            {/* Login Button */}
            <button className="w-full bg-amber-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-amber-600 transition-colors">
              Sign in
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="text-amber-500 hover:text-amber-600 font-medium">Create an account</a>
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

export default LoginForm;