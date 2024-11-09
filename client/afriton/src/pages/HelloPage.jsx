import React from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';

export const HelloPage = () => {
    const slides = [
        {
            title: "Seamless Cross-Border Payments Across Africa",
            description: "Transfer money instantly using our unified African digital currency, Afriton.",
            image: "https://img.freepik.com/premium-photo/group-joyful-black-people-both-men-women-hugging-smiling-warmly-each-other_833768-884.jpg",
            bg: "bg-gradient-to-r from-blue-900 to-blue-800"
        },
        {
            title: "Secure Biometric Payments",
            description: "Make payments safely using just your fingerprint, even without your device.",
            image: "https://img.freepik.com/premium-photo/group-joyful-black-people-both-men-women-hugging-smiling-warmly-each-other_833768-884.jpg",
            bg: "bg-gradient-to-r from-blue-800 to-blue-700"
        },
        {
            title: "Real-Time Currency Conversion",
            description: "Get the best rates with instant conversion between local currencies and Afriton.",
            image: "https://img.freepik.com/premium-photo/group-joyful-black-people-both-men-women-hugging-smiling-warmly-each-other_833768-884.jpg",
            bg: "bg-gradient-to-r from-blue-800 to-blue-900"
        },
    ];

    return (
        <div className="relative h-[700px]">
            <Splide
                options={{
                    type: 'loop',
                    autoplay: true,
                    interval: 5000,
                    arrows: true,
                    pagination: false,
                    pauseOnHover: false,
                    speed: 800,
                }}

            >
                {slides.map((slide, index) => (
                    <SplideSlide key={index}>
                        <div
                            style={{ backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.6), rgba(17, 24, 39, 0.9)), url(${slide.image})` }}
                            className={`flex h-[80vh] max-md:h-[60vh] items-center justify-center bg-cover bg-center text-white px-6 ${slide.bg}`}
                        >
                            <div className="max-w-5xl max-md:w-full mx-auto text-center p-8">
                                <h1 className="text-3xl md:text-6xl font-bold mb-6 transition-all duration-500 ease-in-out hover:text-yellow-600">{slide.title}</h1>
                                <p className="text-md md:text-2xl mb-8 leading-relaxed max-w-xl mx-auto">{slide.description}</p>
                                <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
                                    Get Started
                                </button>
                            </div>
                        </div>
                    </SplideSlide>
                ))}
            </Splide>

        </div>
    );
};
