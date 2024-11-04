import React, { useState, useEffect } from 'react';
import { 
  FaMoneyBillWave, 
  FaFingerprint, 
  FaShieldAlt,
  FaGoogle,
  FaEnvelope,
  FaPhone,
  FaIdCardAlt,
  FaMapMarkerAlt,
  FaChevronRight,
  FaFacebook,
  FaTwitter,
  FaLinkedin
} from 'react-icons/fa';

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const slides = [
    {
      title: "Seamless Cross-Border Payments Across Africa",
      description: "Transfer money instantly using our unified African digital currency, Afriton",
      bg:"https://cdn.pixabay.com/photo/2017/09/03/06/12/abstract-2709402_1280.png",
    },
    {
      title: "Secure Biometric Payments",
      bg:"https://wallpapers.com/images/featured/abstract-blue-background-ygdezk56l4t03bq3.jpg",
      description: "Make payments safely using just your fingerprint, even without your device"
    },
    {
      title: "Real-Time Currency Conversion",
      description: "Get the best rates with instant conversion between local currencies and Afriton",
      bg:"https://wallpapers.com/images/hd/dark-blue-plain-kskl9bwuubcnb6r3.jpg"
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl font-bold">
              ×
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed w-full z-40 bg-white shadow-md">
        <div className="max-w-[90rem] mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="text-2xl font-bold text-blue-600">Afriton</div>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden text-xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              ☰
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="hover:text-blue-600">Features</a>
              <a href="#about" className="hover:text-blue-600">About</a>
              <a href="#contact" className="hover:text-blue-600">Contact</a>
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
              >
                Login
              </button>
              <button 
                onClick={() => setIsRegisterOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Register
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden pb-4">
              <a href="#features" className="block py-2 hover:text-blue-600">Features</a>
              <a href="#about" className="block py-2 hover:text-blue-600">About</a>
              <a href="#contact" className="block py-2 hover:text-blue-600">Contact</a>
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="block w-full text-left py-2 hover:text-blue-600"
              >
                Login
              </button>
              <button 
                onClick={() => setIsRegisterOpen(true)}
                className="block w-full text-left py-2 hover:text-blue-600"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-[600px]">
        {slides.map((slide, index) => (
          <div
          style={{background: `url(${slide.bg})`,backgroundRepeat:'no-repeat',backgroundSize:'cover'}}
            key={index}
            className={`absolute inset-0 flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800  bg-cover text-white px-4 transition-opacity duration-500 ${
              currentSlide === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">{slide.title}</h1>
              <p className="text-xl md:text-2xl">{slide.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-[90rem] mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Features</h2>
          <div className="grid lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FaMoneyBillWave className="w-12 h-12 text-blue-600" />,
                title: "Unified Currency",
                description: "Send money across Africa using our single digital currency"
              },
              {
                icon: <FaFingerprint className="w-12 h-12 text-blue-600" />,
                title: "Biometric Payments",
                description: "Make secure payments using just your fingerprint"
              },
              {
                icon: <FaShieldAlt className="w-12 h-12 text-blue-600" />,
                title: "Secure Transactions",
                description: "Enterprise-grade security with advanced encryption"
              },
              {
                icon: <FaShieldAlt className="w-12 h-12 text-blue-600" />,
                title: "Secure Transactions",
                description: "Enterprise-grade security with advanced encryption"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="max-w-[90rem] mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">About Afriton</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-gray-600 mb-6">
                Afriton aims to revolutionize cross-border payments in Africa by providing a secure, 
                efficient, and unified payment system that reduces dependency on physical cash.
              </p>
              <ul className="space-y-4">
                {[
                  "99.99% system uptime",
                  "Support for 100,000 transactions per second",
                  "Real-time currency conversion",
                  "Multi-factor authentication"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <FaChevronRight className="text-blue-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-blue-100 rounded-lg p-8 flex items-center justify-center">
              <img src="https://www.shutterstock.com/image-vector/set-various-payment-options-isolated-260nw-2450433103.jpg" alt="About Afriton" className="rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-[90rem] mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Contact Us</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <FaEnvelope className="text-blue-600 text-2xl" />
                <div>
                  <h4 className="font-semibold">Email</h4>
                  <p>contact@afriton.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <FaPhone className="text-blue-600 text-2xl" />
                <div>
                  <h4 className="font-semibold">Phone</h4>
                  <p>+1 234 567 890</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <FaMapMarkerAlt className="text-blue-600 text-2xl" />
                <div>
                  <h4 className="font-semibold">Address</h4>
                  <p>123 Afriton Street, Lagos, Nigeria</p>
                </div>
              </div>
            </div>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                className="w-full p-3 border rounded focus:outline-none focus:border-blue-600"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 border rounded focus:outline-none focus:border-blue-600"
              />
              <textarea
                placeholder="Message"
                rows="4"
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-600"
              ></textarea>
              <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-[90rem] mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Afriton</h3>
              <p className="text-gray-400">
                Revolutionizing cross-border payments across Africa
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-white">About</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <FaFacebook className="text-gray-400 hover:text-white text-2xl cursor-pointer" />
                <FaTwitter className="text-gray-400 hover:text-white text-2xl cursor-pointer" />
                <FaLinkedin className="text-gray-400 hover:text-white text-2xl cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            © 2024 Afriton. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <Modal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        title="Login"
      >
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded focus:outline-none focus:border-blue-600"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded focus:outline-none focus:border-blue-600"
          />
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Login
          </button>
          <button className="w-full border border-gray-300 py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-50">
            <FaGoogle /> Continue with Google
          </button>
        </form>
      </Modal>

      {/* Register Modal */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Register"
      >
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 border rounded focus:outline-none focus:border-blue-600"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded focus:outline-none focus:border-blue-600"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded focus:outline-none focus:border-blue-600"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-3 border rounded focus:outline-none focus:border-blue-600"
          />
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Register
          </button>
          <button className="w-full border border-gray-300 py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-50">
            <FaGoogle color='red'/> Continue with Google
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default LandingPage;