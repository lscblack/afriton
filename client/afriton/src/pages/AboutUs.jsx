import React, { useEffect } from 'react'
import {

    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaChevronRight,

} from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
export const AboutUs = () => {
    useEffect(() => {
        AOS.init({ duration: 800 });
    }, []);

    return (
        <>
            <section id="about" className="py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">About Afriton</h2>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 data-aos="fade-in" className="text-2xl font-bold mb-4">Our Mission</h3>
                            <p data-aos="zoom-in" className="text-gray-600 mb-6">
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
                                    <li data-aos="zoom-in" key={index} className="flex items-center gap-2">
                                        <FaChevronRight className="text-yellow-600" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-1" data-aos="zoom-in">
                            <img src="https://s44650.pcdn.co/wp-content/uploads/2023/07/africa-digital-payments-1200-1678064273-1.jpg" alt="About Afriton" className="rounded-lg w-full h-auto" />
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
