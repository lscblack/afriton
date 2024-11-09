import React, { useState } from 'react';
import {
    FaGoogle,
    FaEye,
    FaEyeSlash,
    FaCheckCircle,
    FaExclamationCircle
} from 'react-icons/fa';

export const Register = ({ onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const validateField = (name, value) => {
        switch (name) {
            case 'fullName':
                return value.length < 3 ? 'Name must be at least 3 characters' : '';
            case 'email':
                return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) 
                    ? 'Please enter a valid email' 
                    : '';
            case 'password':
                return !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(value)
                    ? 'Password must be at least 8 characters with 1 uppercase, 1 lowercase and 1 number'
                    : '';
            case 'confirmPassword':
                return value !== formData.password 
                    ? 'Passwords do not match' 
                    : '';
            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (touched[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: validateField(name, value)
            }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        setErrors(prev => ({
            ...prev,
            [name]: validateField(name, value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Validate all fields
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setTouched({
                fullName: true,
                email: true,
                password: true,
                confirmPassword: true
            });
            setIsLoading(false);
            return;
        }

        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Form submitted:', formData);
            // Handle successful registration here
        } catch (error) {
            console.error('Registration error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const InputField = ({ 
        type, 
        name, 
        placeholder, 
        value, 
        isPassword,
        showPasswordToggle,
        setShowPasswordToggle 
    }) => (
        <div className="relative">
            <input
                type={isPassword ? (showPasswordToggle ? 'text' : 'password') : type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 pl-4 border rounded-lg transition-all duration-300
                    ${errors[name] && touched[name] 
                        ? 'border-red-500 bg-red-50' 
                        : touched[name] && !errors[name]
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300'
                    }
                    focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent`}
            />
            {isPassword && (
                <button
                    type="button"
                    onClick={() => setShowPasswordToggle(!showPasswordToggle)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                    {showPasswordToggle ? <FaEyeSlash /> : <FaEye />}
                </button>
            )}
            {touched[name] && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {errors[name] ? (
                        <FaExclamationCircle className="text-red-500" />
                    ) : (
                        <FaCheckCircle className="text-green-500" />
                    )}
                </div>
            )}
            {errors[name] && touched[name] && (
                <p className="mt-1 text-xs text-red-500">{errors[name]}</p>
            )}
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
            />
            <InputField
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
            />
            <InputField
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                isPassword
                showPasswordToggle={showPassword}
                setShowPasswordToggle={setShowPassword}
            />
            <InputField
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                isPassword
                showPasswordToggle={showConfirmPassword}
                setShowPasswordToggle={setShowConfirmPassword}
            />

            <button 
                type="submit"
                disabled={isLoading}
                className={`w-full bg-yellow-600 text-white py-3 rounded-lg 
                    transition-all duration-300 relative overflow-hidden
                    ${isLoading ? 'bg-yellow-400 cursor-not-allowed' : 'hover:bg-yellow-700'}
                    transform hover:scale-[1.02] active:scale-[0.98]`}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                        <span className="ml-2">Registering...</span>
                    </div>
                ) : (
                    'Register'
                )}
            </button>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
            </div>

            <button
                type="button"
                className="w-full border border-gray-300 py-3 rounded-lg 
                    flex items-center justify-center gap-2 
                    hover:bg-gray-50 transition-all duration-300
                    transform hover:scale-[1.02] active:scale-[0.98]
                    hover:border-gray-400"
            >
                <FaGoogle className="text-red-600" />
                <span className="text-gray-700">Continue with Google</span>
            </button>

            <p className="text-center text-sm text-gray-600 mt-6">
                Already have an account?{' '}
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-yellow-600 hover:text-yellow-700 font-medium
                        transition-colors duration-300"
                >
                    Login here
                </button>
            </p>
        </form>
    );
};