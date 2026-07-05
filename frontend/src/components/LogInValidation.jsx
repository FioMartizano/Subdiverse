import React from 'react';

const LogInValidation = ({ isOpen, onClose, loginHref = "/login", signupHref = "/signup" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-40 backdrop-blur-sm p-4">
      <div className="relative bg-white rounded-xl shadow-lg max-w-sm w-full p-8 border border-gray-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome Resident</h2>
          <p className="text-sm text-gray-500 mb-8">
            Please log in or register to access the community portal.
          </p>

          {/* Action Links */}
          <div className="space-y-3">
            <a
              href="/login"
              className="block w-full py-2.5 bg-secondary text-white font-medium rounded hover:bg-primary transition-colors"
            >
              Sign In
            </a>
            <a
              href={signupHref}
              className="block w-full py-2.5 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors"
            >
              Create Account
            </a>
          </div>

          <p className="mt-6 text-[11px] text-gray-400">
            Secure subdivision portal access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogInValidation;