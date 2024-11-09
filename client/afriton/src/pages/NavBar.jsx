import React, { useState, useEffect } from 'react';

export const NavBar = ({ setIsMenuOpen, setIsLoginOpen, setIsRegisterOpen, isMenuOpen }) => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed w-full z-40 ${isScrolled ? 'md:bg-white shadow-md bg-black text-white' : 'md:bg-[#0000002d] bg-black text-white'} transition-colors duration-300`}>
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="text-2xl font-bold text-yellow-600">Afriton</div>

                    <button
                        className="md:hidden text-xl"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        ☰
                    </button>

                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#features" className="hover:text-yellow-600 transition-colors">Features</a>
                        <a href="#about" className="hover:text-yellow-600 transition-colors">About</a>
                        <a href="#contact" className="hover:text-yellow-600 transition-colors">Contact</a>
                        <button
                            onClick={() => setIsLoginOpen(true)}
                            className="px-4 py-2 border border-yellow-600 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setIsRegisterOpen(true)}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                            Register
                        </button>
                    </div>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden pb-4 bg-black p-4 shadow-md">
                        <h3 className='font-bold text-2xl'>All Links</h3>
                        <a href="#features" className="block py-2 hover:text-yellow-600">Features</a>
                        <a href="#about" className="block py-2 hover:text-yellow-600">About</a>
                        <a href="#contact" className="block py-2 hover:text-yellow-600">Contact</a>
                        <button
                            onClick={() => {
                                setIsLoginOpen(true);
                                setIsMenuOpen(false);
                            }}
                            className="block w-full text-left py-2 hover:text-yellow-600"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => {
                                setIsRegisterOpen(true);
                                setIsMenuOpen(false);
                            }}
                            className="block w-full text-left py-2 hover:text-yellow-600"
                        >
                            Register
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};
