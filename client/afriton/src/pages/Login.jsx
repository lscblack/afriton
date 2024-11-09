import React, { useState } from 'react';
import { FaGoogle, FaBackward } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // For navigation after successful login

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (!e.target.value) {
            setEmailError('Email is required');
        } else if (!/\S+@\S+\.\S+/.test(e.target.value)) {
            setEmailError('Please enter a valid email');
        } else {
            setEmailError('');
        }
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (!e.target.value) {
            setPasswordError('Password is required');
        } else if (e.target.value.length < 6) {
            setPasswordError('Password must be at least 6 characters');
        } else {
            setPasswordError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        // Simulate API request
        try {
            if (!emailError && !passwordError && email && password) {
                // Mock API request here (e.g., using fetch or axios)
                // Example of successful login:
                const response = await fakeLoginApiCall(email, password);
                if (response.success) {
                    setLoginSuccess(true);
                    setTimeout(() => navigate('/dashboard'), 2000); // Redirect after 2 seconds
                }
            }
        } catch (error) {
            setErrorMessage('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Simulated API call (replace with actual API request)
    const fakeLoginApiCall = (email, password) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email === 'user@example.com' && password === 'password123') {
                    resolve({ success: true });
                } else {
                    reject({ success: false });
                }
            }, 1500);
        });
    };

    return (
        <div className="bg-gradient-to-r from-yellow-900 to-red-900 h-screen flex justify-center items-center ">
            <div className="w-4/6 max-md:w-full h-[700px] grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-lg overflow-hidden">
                {/* Left Side Image */}
                <div className="hidden lg:block bg-cover bg-center" style={{ backgroundImage: "url('https://i.pinimg.com/originals/e2/a6/a5/e2a6a58c5578d620e7d55677598593a0.gif')" }}>
                </div>

                {/* Right Side Form */}
                <div className="flex justify-center items-center bg-white p-6  shadow-lg relative">
                    <button onClick={() => navigate("/")} className='bg-yellow-500 hover:bg-yellow-600 text-white h-12 w-12 rounded-full absolute top-3 left-3 flex justify-center items-center' title='Back To Home'><FaBackward /></button>
                    <div className="w-full ">
                        <h2 className="text-3xl font-semibold text-center text-yellow-600 mb-6 animate__animated animate__fadeIn">
                            Login to <span className="font-bold text-yellow-600 animate__animated animate__fadeIn">Afriton</span>
                        </h2>
                        {/* Error or Success Message */}
                        {errorMessage && <p className="text-red-500 text-sm mt-4">{errorMessage}</p>}
                        {loginSuccess && (
                            <p className="text-green-500 text-sm mt-4">
                                Login successful! Redirecting to dashboard...
                            </p>
                        )}
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Email Input */}
                            <div>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    className={`w-full p-4 border rounded-md focus:outline-none focus:border-yellow-600 ${emailError ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {emailError && <p className="text-red-500 text-sm mt-2">{emailError}</p>}
                            </div>

                            {/* Password Input */}
                            <div>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    className={`w-full p-4 border rounded-md focus:outline-none focus:border-yellow-600 ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {passwordError && <p className="text-red-500 text-sm mt-2">{passwordError}</p>}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-yellow-600 text-white py-4 rounded-md hover:bg-yellow-700 disabled:opacity-50"
                                disabled={emailError || passwordError || !email || !password || isSubmitting}
                            >
                                {isSubmitting ? 'Logging in...' : 'Login'}
                            </button>

                            {/* Google Login Button */}
                            <button
                                type="button"
                                className="w-full border border-gray-300 py-4 rounded-md flex items-center justify-center gap-2 hover:bg-gray-50 "
                            >
                                <FaGoogle className="text-yellow-600" />
                                Continue with Google
                            </button>
                        </form>



                        {/* Register Link */}
                        <p className="text-center text-sm text-gray-600 mt-4">
                            New to Afriton?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/register')}
                                className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors duration-300"
                            >
                                Register here
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
