import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Login  from './Login';
import  Register  from './Register';
import { Footer } from '../comps/Footer';
import UserFeedback from '../comps/UserFeedBack';
import Services from '../comps/services';
import Features from '../comps/Futures';
import { NavBar } from '../comps/NavBar';
import { HelloPage } from '../comps/HelloPage';
import { ContactUs } from '../comps/ContactUs';
import { AboutUs } from '../comps/AboutUs';
import { FaArrowAltCircleRight, FaCreativeCommonsSamplingPlus, FaTimesCircle, FaWindowMaximize } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
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
          className=" rounded-lg p-6  w-full transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            {/* <h2 className="text-xl font-bold">{title}</h2> */}
            <button
            title='Close Form'
              onClick={onClose}
              className="text-gray-300 top-11 right-11 absolute hover:text-gray-200 text-3xl font-bold"
            >
              <FaTimesCircle/>
            </button>
            <button
            title='Open In Form'
              onClick={()=>navigate(title)}
              className="text-slate-200 top-40 left-11 absolute hover:text-slate-200 text-3xl font-bold"
            >
              <FaArrowAltCircleRight/>
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
      {/* <Modal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} title="/login">
        <Login />
      </Modal> */}
{/* 
      <Modal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} title="/register">
        <Register />
      </Modal> */}
    </div>
  );
};

export default LandingPage;
