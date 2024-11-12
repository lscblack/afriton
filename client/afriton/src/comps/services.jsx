import React, { useEffect } from 'react';
import {
    FaExchangeAlt,
    FaUniversity,
    FaChartLine,
    FaFingerprint,
    FaHandHoldingUsd,
    FaPiggyBank,
    FaBuilding,
    FaUsers,
    FaArrowRight
} from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
const services = [
    {
        id: 1,
        title: "Cross Border Payments",
        description: "Send money seamlessly to any Afriton user across Africa with minimal fees and instant processing.",
        icon: <FaExchangeAlt className="text-4xl" />,
        features: [
            "Instant transfers across Africa",
            "Low transaction fees",
            "Real-time tracking",
            "Secure transactions"
        ]
    },
    {
        id: 2,
        title: "Banking Services",
        description: "Comprehensive banking solutions including deposits, withdrawals, and account management.",
        icon: <FaUniversity className="text-4xl" />,
        features: [
            "Easy deposits",
            "Quick withdrawals",
            "Account management",
            "24/7 banking access"
        ]
    },
    {
        id: 3,
        title: "Money Flow Control",
        description: "Take full control of your finances with advanced money management tools and tracking.",
        icon: <FaChartLine className="text-4xl" />,
        features: [
            "Transaction monitoring",
            "Spending analytics",
            "Budget planning",
            "Custom alerts"
        ]
    },
    {
        id: 4,
        title: "Multi-Channel Access",
        description: "Access your account through fingerprint, card, mobile app, or USSD banking options.",
        icon: <FaFingerprint className="text-4xl" />,
        features: [
            "Biometric security",
            "Mobile app access",
            "USSD banking",
            "Card transactions"
        ]
    },
    {
        id: 5,
        title: "Payments & Shopping",
        description: "Send, receive, and shop with your Afriton account at competitive rates.",
        icon: <FaHandHoldingUsd className="text-4xl" />,
        features: [
            "Peer-to-peer transfers",
            "Shopping payments",
            "Merchant integration",
            "Loyalty rewards"
        ]
    },
    {
        id: 6,
        title: "Financial Growth",
        description: "Access loans and earn credits through our referral program and savings initiatives.",
        icon: <FaPiggyBank className="text-4xl" />,
        features: [
            "Quick loans",
            "Referral rewards",
            "Credit system",
            "Investment options"
        ]
    },
    {
        id: 7,
        title: "Business Solutions",
        description: "Streamline your business payments with bulk processing and automated salary payments.",
        icon: <FaBuilding className="text-4xl" />,
        features: [
            "Bulk payments",
            "Automated salaries",
            "Business analytics",
            "Employee management"
        ]
    },
    {
        id: 8,
        title: "Family & Savings",
        description: "Create sub-accounts for family savings and set achievable financial goals.",
        icon: <FaUsers className="text-4xl" />,
        features: [
            "Sub-accounts",
            "Goal tracking",
            "Flexible savings plans",
            "Family management"
        ]
    }
];

const ServiceCard = ({ service }) => {
    return (
        <div  className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 to-yellow-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-yellow-600/10 text-yellow-600 transition-all duration-300 group-hover:bg-yellow-600 group-hover:text-white">
                        {service.icon}
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-yellow-600 transition-all duration-300">
                        <FaArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-300 group-hover:text-white" />
                    </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-yellow-600 dark:group-hover:text-yellow-500 transition-colors duration-300">
                    {service.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {service.description}
                </p>

                <div className="mt-auto">
                    <div className="space-y-2">
                        {service.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-600"></div>
                                <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Services = () => {
    useEffect(() => {
        AOS.init({ duration: 800 });
    }, []);
    return (
        <section className="relative py-20 overflow-hidden bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-0 w-72 h-72 bg-yellow-600/5 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-yellow-600/5 rounded-full filter blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 relative">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        Our Comprehensive{' '}
                        <span className="text-yellow-600">Services</span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Experience the future of African banking with our innovative financial solutions
                        designed to make your money management seamless and efficient.
                    </p>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service) => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>

                {/* Call to Action */}
                <div className="text-center mt-16" data-aos="zoom-in">
                    <div className="inline-flex flex-col items-center">
                        <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                            Ready to experience seamless financial services?
                        </p>
                        <button className="group relative px-8 py-4 bg-yellow-600 text-white rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-yellow-600/20">
                            <span className="relative z-10">Get Started Today</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Services;