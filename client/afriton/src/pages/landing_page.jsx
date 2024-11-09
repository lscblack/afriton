import React, { useState, useEffect } from 'react';
import {

  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaChevronRight,

} from 'react-icons/fa';
import { Login } from './Login';
import { Register } from './Register';
import { Footer } from './Footer';
import UserFeedback from './UserFeedBack';
import Services from './services';
import Features from './Futures';
import { NavBar } from './NavBar';
import { HelloPage } from './HelloPage';
import { ContactUs } from './ContactUs';


const LandingPage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);




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
      <HelloPage />


      {/* Features Section */}
      <Features />
      {/* Services We Offer Section */}
      <Services />
      {/* About Section */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
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
                    <FaChevronRight className="text-yellow-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-100 rounded-lg p-1">
              <img src="https://s44650.pcdn.co/wp-content/uploads/2023/07/africa-digital-payments-1200-1678064273-1.jpg" alt="About Afriton" className="rounded-lg w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* User feedback Section */}
      <UserFeedback />

      {/* Contact Section */}
      <ContactUs />
      {/* Footer */}
      <Footer />


      {/* Modals */}
      <Modal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        title="Login"
      >
        <Login />
      </Modal>

      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Register"
      >
        <Register />
      </Modal>
    </div>
  );
};

export default LandingPage;