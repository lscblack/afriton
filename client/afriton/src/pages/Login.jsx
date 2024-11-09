import React from 'react'
import {
    FaGoogle,
} from 'react-icons/fa';
export const Login = () => {
    return (
        <>
            <form className="space-y-4">
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 border rounded focus:outline-none focus:border-blue-600"
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 border rounded focus:outline-none focus:border-blue-600"
                />
                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    Login
                </button>
                <button className="w-full border border-gray-300 py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-50">
                    <FaGoogle /> Continue with Google
                </button>
            </form>
        </>
    )
}
