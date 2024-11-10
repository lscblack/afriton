import React, { useEffect } from 'react'
import {

    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,

} from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
export const ContactUs = () => {
    useEffect(() => {
        AOS.init({ duration: 800 });
    }, []);
    return (
        <>
            <section id="contact" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12" data-aos="fade-up">Contact Us</h2>
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4" data-aos="fade-in">
                                <FaEnvelope className="text-yellow-600 text-2xl" />
                                <div>
                                    <h4 className="font-semibold">Email</h4>
                                    <p>contact@afriton.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4" data-aos="fade-in">
                                <FaPhone className="text-yellow-600 text-2xl" />
                                <div>
                                    <h4 className="font-semibold">Phone</h4>
                                    <p>+250 790 110 231</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4" data-aos="fade-in">
                                <FaMapMarkerAlt className="text-yellow-600 text-2xl" />
                                <div>
                                    <h4 className="font-semibold">Address</h4>
                                    <p>123 Afriton Street, Kigali, Rwanda</p>
                                </div>
                            </div>
                        </div>
                        <form className="space-y-4" data-aos="zoom-in">
                            <input
                                type="text"
                                placeholder="Name"
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                            />
                            <textarea
                                placeholder="Message"
                                rows="4"
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                            ></textarea>
                            <button className="w-full bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition-colors">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </section>

        </>
    )
}
