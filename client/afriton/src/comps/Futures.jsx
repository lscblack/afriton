import React, { useEffect, useState } from 'react';
import {
    FaMoneyBillWave,
    FaFingerprint,
    FaShieldAlt,
    FaArrowRight,
    FaCheckCircle,
    FaUsers,
    FaMobile
} from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';

const features = [
    {
        icon: <FaMoneyBillWave />,
        title: "Unified Currency",
        description: "Send money across Africa using our single digital currency",
        benefits: [
            "Zero conversion fees",
            "Instant settlements",
            "Cross-border support",
            "Real-time rates"
        ]
    },
    {
        icon: <FaFingerprint />,
        title: "Biometric Payments",
        description: "Make secure payments using just your fingerprint",
        benefits: [
            "Quick authentication",
            "Fraud prevention",
            "Easy setup",
            "Multi-device support"
        ]
    },
    {
        icon: <FaShieldAlt />,
        title: "Secure Transactions",
        description: "Enterprise-grade security with advanced encryption",
        benefits: [
            "End-to-end encryption",
            "24/7 monitoring",
            "Fraud detection",
            "Secure storage"
        ]
    }
];

const FeatureCard = ({ feature, isActive, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`group cursor-pointer relative overflow-hidden rounded-2xl transition-all duration-500 
        ${isActive ? 'bg-yellow-600 md:row-span-2' : 'bg-white dark:bg-[#120a1b] hover:bg-yellow-50 dark:hover:bg-[#383d19]'}`}
        >
            <div className="relative p-6 h-full z-10">
                <div className={`inline-flex p-3 rounded-xl mb-6 transition-all duration-300
          ${isActive ? 'bg-white dark:bg-[#120a1b]' : 'bg-yellow-50 dark:bg-[#2a173f] group-hover:bg-yellow-100'}`}>
                    <div className={`text-3xl ${isActive ? 'text-yellow-600' : 'text-yellow-600'}`}>
                        {feature.icon}
                    </div>
                </div>

                <h3 className={`text-xl font-bold mb-3 transition-colors duration-300
          ${isActive ? 'text-white' : 'text-gray-900 dark:text-gray-200'}`}>
                    {feature.title}
                </h3>

                <p className={`mb-6 transition-colors duration-300
          ${isActive ? 'text-yellow-50' : 'text-gray-600 dark:text-gray-200'}`}>
                    {feature.description}
                </p>

                <div className={`space-y-3 transition-all duration-500 
          ${isActive ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0'}`}>
                    {feature.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <FaCheckCircle className="text-white" />
                            <span className="text-yellow-50">{benefit}</span>
                        </div>
                    ))}
                </div>

                <div className={`mt-6 flex items-center space-x-2 
          ${isActive ? 'text-white' : 'text-yellow-600 dark:text-gray-200'}`}>
                    <span className="font-medium">Learn More</span>
                    <FaArrowRight className={`transform transition-transform duration-300 
            ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`} />
                </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 dark:to-[#0b0b0b]/40"></div>
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-yellow-600 transform origin-left transition-transform duration-500
        ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
        </div>
    );
};

export const Features = () => {
    const [activeFeature, setActiveFeature] = useState(0);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        AOS.init({ duration: 800 });
        // Sync with system dark mode
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(darkModeMediaQuery.matches);

        darkModeMediaQuery.addEventListener('change', (e) => {
            setIsDarkMode(e.matches);
        });
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

    return (
        <section id="features" className="relative py-24 overflow-hidden ">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-[#130114]"></div>
            <div className="absolute inset-0">
                <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-100/50 rounded-full blur-3xl dark:bg-black/30"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-50/50 rounded-full blur-3xl dark:bg-black/30"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 relative">
                <div data-aos="fade-up" className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent dark:from-gray-200 dark:to-gray-500">
                        Revolutionary Features
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-200">
                        Experience the next generation of digital banking with our innovative features
                        designed for the modern African market.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            feature={feature}
                            isActive={activeFeature === index}
                            onClick={() => setActiveFeature(index)}
                        />
                    ))}
                </div>

                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { icon: <FaUsers />, value: "2M+", label: "Active Users" },
                        { icon: <FaMobile />, value: "50K+", label: "Daily Transactions" },
                        { icon: <FaShieldAlt />, value: "99.9%", label: "Secure Transfers" },
                        { icon: <FaMoneyBillWave />, value: "$100M+", label: "Processed Monthly" }
                    ].map((stat, index) => (
                        <div data-aos="fade-up" key={index} className="text-center">
                            <div className="inline-flex p-3 rounded-xl bg-yellow-50 text-yellow-600 mb-4 dark:bg-[#120a1b] dark:text-yellow-400">
                                {stat.icon}
                            </div>
                            <div className="text-2xl font-bold text-gray-900 mb-1 dark:text-gray-200">{stat.value}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
