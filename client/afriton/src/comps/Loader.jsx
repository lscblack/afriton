import React from 'react';

const Loading = () => {
  const text = "Afriton";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative">
        {/* Afriton Circular Loading Animation */}
        <div className="relative flex justify-center items-center">
          <div className="w-36 h-36 border-4 border-yellow-600 border-solid border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-36 h-36 flex items-center justify-center">
            {/* Animated Afriton Text */}
            <div className="text-2xl font-bold text-yellow-600">
              {text.split('').map((letter, index) => (
                <span
                  key={index}
                  className="letter-animation"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="mt-4 text-lg text-center text-gray-800">
          <span className="animate-pulse text-yellow-600">Cross Border Payment</span>
        </div>
      </div>
    </div>
  );
};

export default Loading;
