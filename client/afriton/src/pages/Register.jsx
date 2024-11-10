import React, { useState } from 'react';
import { FaBackward, FaGoogle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // For navigation after successful registration

export const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registerSuccess, setRegisterSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
        if (!e.target.value) {
            setUsernameError('Username is required');
        } else {
            setUsernameError('');
        }
    };

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

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        if (e.target.value !== password) {
            setConfirmPasswordError('Passwords do not match');
        } else {
            setConfirmPasswordError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        // Simulate API request
        try {
            if (!usernameError && !emailError && !passwordError && !confirmPasswordError && username && email && password && confirmPassword) {
                // Mock API request here (e.g., using fetch or axios)
                const response = await fakeRegisterApiCall(username, email, password);
                if (response.success) {
                    setRegisterSuccess(true);
                    setTimeout(() => navigate('/login'), 2000); // Redirect to login after 2 seconds
                }
            }
        } catch (error) {
            setErrorMessage('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Simulated API call (replace with actual API request)
    const fakeRegisterApiCall = (username, email, password) => {
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
        <div className=" bg-gradient-to-r from-yellow-900 to-red-900 h-screen rounded-lg  flex justify-center items-center">
            <div className="w-4/6 max-md:w-full h-[700px] grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-lg overflow-hidden max-lg:overflow-scroll max-lg:h-full">
                {/* Left Side Image */}
                <div className="hidden lg:block bg-cover bg-center" style={{ backgroundImage: "url('https://i.pinimg.com/originals/65/ea/96/65ea969295c1b59ff4b805f9774508cc.gif')" }}>
                    {/* You can replace '/path-to-your-image.jpg' with the actual image URL */}
                </div>

                {/* Right Side Form */}
                <div className="flex justify-center items-center bg-white p-6  shadow-lg relative">
                    <button onClick={() => navigate("/")} className='bg-yellow-500 hover:bg-yellow-600 text-white h-12 w-12 rounded-full absolute top-3 max-lg:top-6 max-lg:left-1 left-3 max-lg:text-sm max-lg:h-9 max-lg:w-9 flex justify-center items-center' title='Back To Home'><FaBackward /></button>

                    <div className="w-full ">
                        <h2 className="text-3xl max-lg:text-2xl font-semibold text-center text-yellow-600 mb-6 animate__animated animate__fadeIn">
                            Create an Account at <span className="font-bold text-yellow-600 animate__animated animate__fadeIn">Afriton</span>
                        </h2>
                        {/* Error or Success Message */}
                        {errorMessage && <p className="text-red-500 text-sm mt-4">{errorMessage}</p>}
                        {registerSuccess && (
                            <p className="text-green-500 text-sm mt-4">
                                Registration successful! Redirecting to login...
                            </p>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Username Input */}
                            <div>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={handleUsernameChange}
                                    className={`w-full p-4 border rounded-md focus:outline-none focus:border-yellow-600 ${usernameError ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {usernameError && <p className="text-red-500 text-sm mt-2">{usernameError}</p>}
                            </div>

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

                            {/* Confirm Password Input */}
                            <div>
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    className={`w-full p-4 border rounded-md focus:outline-none focus:border-yellow-600 ${confirmPasswordError ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {confirmPasswordError && <p className="text-red-500 text-sm mt-2">{confirmPasswordError}</p>}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-yellow-600 text-white py-4 rounded-md hover:bg-yellow-700 disabled:opacity-50"
                                disabled={usernameError || emailError || passwordError || confirmPasswordError || !username || !email || !password || !confirmPassword || isSubmitting}
                            >
                                {isSubmitting ? 'Registering...' : 'Register'}
                            </button>

                            {/* Google Login Button */}
                            <button
                                type="button"
                                className="w-full border border-gray-300 py-4 rounded-md flex items-center justify-center gap-2 hover:bg-gary-50"
                            >
                                <FaGoogle className="text-red-600" />
                                Continue with Google
                            </button>
                        </form>


                        {/* Login Link */}
                        <p className="text-center text-sm text-gray-600 mt-4">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors duration-300"
                            >
                                Login here
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
