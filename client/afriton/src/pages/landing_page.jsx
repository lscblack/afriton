import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Login } from './Login';
import { Register } from './Register';
import { Footer } from './Footer';
import UserFeedback from './UserFeedBack';
import Services from './services';
import Features from './Futures';
import { NavBar } from './NavBar';
import { HelloPage } from './HelloPage';
import { ContactUs } from './ContactUs';
import { AboutUs } from './AboutUs';

const LandingPage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="bg-white rounded-lg p-6 max-w-md w-full transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
            >
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
      <NavBar setIsMenuOpen={setIsMenuOpen} setIsLoginOpen={setIsLoginOpen} setIsRegisterOpen={setIsRegisterOpen} isMenuOpen={isMenuOpen} />

      {/* Hello Page */}
      <div data-aos="fade-up">
        <HelloPage />
      </div>

      {/* Features Section with Animation */}
      <div data-aos="fade-up">
        <Features />
      </div>

      {/* Services We Offer Section with Animation */}
      <div data-aos="fade-up">
        <Services />
      </div>

      {/* About Section with Animation */}
      <div data-aos="fade-up">
        <AboutUs />
      </div>

      {/* User feedback Section with Animation */}
      <div data-aos="fade-up">
        <UserFeedback />
      </div>

      {/* Contact Section with Animation */}
      <div data-aos="fade-up">
        <ContactUs />
      </div>

      {/* Footer Section */}
      <Footer />

      {/* Modals */}
      <Modal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} title="Login">
        <Login />
      </Modal>

      <Modal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} title="Register">
        <Register />
      </Modal>
    </div>
  );
};

export default LandingPage;
