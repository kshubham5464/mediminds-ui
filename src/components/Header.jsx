import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  return (
    <header className="bg-gradient-to-r from-white-900 to-white-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            <img
              src="/ashoka_emblem.png"
              alt="Ashoka Stambh"
              className="h-16 w-auto"
            />
            <div className="border-l-2 border-white pl-5 flex items-center space-x-3">
              <Link to="/dashboard">
                <img
                  src="/image.png"
                  alt="AYUSH Logo"
                  className="h-16 w-auto hover:opacity-80 transition-opacity"
                />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-black">
                  National AYUSH Terminology Platform
                </h1>
                <p className="text-xs text-black-150">
                  Government of India • Ministry of Ayush
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-black">
              Welcome, {user?.firstName} {user?.lastName}
            </span>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors border = 2 border-red-500"
            >
              Logout
            </button>
           <img
              src="/azadi_ka_amrit_mahotsav.png"
              alt="Azadi Ka Amrit Mahotsav"
              className="h-13 w-auto bg-white p-0.1 rounded"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
