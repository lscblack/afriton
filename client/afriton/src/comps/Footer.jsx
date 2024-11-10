import React from 'react';
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaArrowUp
} from 'react-icons/fa';

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-yellow-600">Subscribe to Our Newsletter</h3>
              <p className="text-gray-400 mt-2">Stay updated with our latest news and updates</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 flex-1 md:flex-none"
              />
              <button className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4 text-yellow-600">Afriton</h3>
            <p className="text-gray-400">
              Revolutionizing cross-border payments across Africa
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400">
                <FaPhoneAlt className="text-yellow-600" />
                <span>+250 790 110 231</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <FaEnvelope className="text-yellow-600" />
                <span>contact@afriton.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <FaMapMarkerAlt className="text-yellow-600" />
                <span>123 Business Street, Africa</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-gray-400 hover:text-yellow-600 transition-colors flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                  Features
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-400 hover:text-yellow-600 transition-colors flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-400 hover:text-yellow-600 transition-colors flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Legal</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-600 transition-colors flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-600 transition-colors flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-600 transition-colors flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Connect With Us</h4>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <a href="#" className="bg-gray-800 p-3 rounded-full hover:bg-yellow-600 transition-colors">
                  <FaFacebook className="text-gray-400 hover:text-white text-xl" />
                </a>
                <a href="#" className="bg-gray-800 p-3 rounded-full hover:bg-yellow-600 transition-colors">
                  <FaTwitter className="text-gray-400 hover:text-white text-xl" />
                </a>
                <a href="#" className="bg-gray-800 p-3 rounded-full hover:bg-yellow-600 transition-colors">
                  <FaLinkedin className="text-gray-400 hover:text-white text-xl" />
                </a>
              </div>
              <p className="text-gray-400 text-sm">
                Follow us on social media to stay connected and updated
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2024 Afriton. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={scrollToTop}
                className="bg-yellow-600 p-3 rounded-full hover:bg-yellow-700 transition-colors"
                aria-label="Scroll to top"
              >
                <FaArrowUp className="text-white text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};