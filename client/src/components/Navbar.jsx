import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion"; 
import { BsRobot, BsCoin } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Local Imports
import { ServerUrl } from "../App.jsx";
import { setUserData } from "../redux/userSlice.js";
import AuthModel from "./AuthModel.jsx";

function Navbar() {
  const { userData, loading } = useSelector((state) => state.user);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showAuth , setShowAuth] = useState(false)

  const handleLogout = async () => {
    try {
      // 1. Added missing "/" before api
      await axios.get(ServerUrl + "/api/auth/logout", { withCredentials: true });
      
      // 2. Clear local state
      dispatch(setUserData(null));
      setShowCreditPopup(false);
      setShowUserPopup(false);
      
      // 3. Redirect to login page
      navigate("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="bg-[#f3f3f3] flex justify-center px-4 pt-6">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-6xl bg-white rounded-3xl shadow-sm border border-gray-200 px-8 py-4 flex justify-between items-center relative"
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-black text-white p-2 rounded-lg">
            <BsRobot size={18} />
          </div>
          <h1 className="font-semibold hidden md:block text-lg">InterviewIQ.AI</h1>
        </div>

        <div className="flex items-center gap-6 relative">
          
          {/* Credits Section - Only show if logged in */}
          {userData && (
            <div className="relative">
              <button
                onClick={() => {
                  if(!userData){
                    setShowAuth(true)
                    return
                  }
                  setShowCreditPopup(!showCreditPopup);
                  setShowUserPopup(false);
                }}
                className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-md hover:bg-gray-200 transition"
              >
                <BsCoin size={20} className="text-yellow-600" />
                {loading ? "..." : (userData?.credits ?? 0)}
              </button>

              {showCreditPopup && (
                <div className="absolute right-0 mt-3 w-64 bg-white shadow-xl border border-gray-200 rounded-xl p-5 z-50">
                  <p className="text-sm text-gray-600 mb-4">
                    Need more credits to continue interviews!
                  </p>
                  <button
                    onClick={() => {
                      navigate("/pricing");
                      setShowCreditPopup(false);
                    }}
                    className="w-full bg-black text-white py-2 rounded-lg text-sm font-medium"
                  >
                    Buy more credits
                  </button>
                </div>
              )}
            </div>
          )}

          {/* User Profile Section */}
          <div className="relative">
            <button
              onClick={() => {
                 if(!userData){
                    setShowAuth(true)
                    return
                  }
                  setShowUserPopup(!showUserPopup);
                  setShowCreditPopup(false);
                
                    // navigate("/auth");
                
              }}
              className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-semibold shadow-md overflow-hidden cursor-pointer"
            >
              {loading ? (
                <div className="animate-pulse bg-gray-700 w-full h-full rounded-full" />
              ) : userData ? (
                userData.name.charAt(0).toUpperCase()
              ) : (
                <FaUserAstronaut size={16} />
              )}
            </button>

            {/* User Details Popup */}
            {showUserPopup && userData && (
              <div className="absolute right-0 mt-3 w-48 bg-white shadow-xl border border-gray-200 rounded-xl p-4 z-50">
                <p className="text-xs text-gray-400 font-normal uppercase tracking-wider">Account</p>
                <p className="text-md text-black font-semibold border-b pb-2 mb-2 truncate">
                  {userData.name}
                </p>
                
                <button
                  onClick={() => {
                    navigate("/history");
                    setShowUserPopup(false);
                  }}
                  className="w-full text-left text-sm py-2 hover:text-blue-600 transition text-gray-600"
                >
                  Interview History
                </button>
                
                <button 
                  className="w-full text-left text-sm py-2 flex items-center gap-2 text-red-500 hover:font-bold transition-all mt-2 pt-2 border-t border-gray-100"
                  onClick={handleLogout} 
                >
                  Logout
                  <HiOutlineLogout size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {showAuth && <AuthModel onClose={()=> setShowAuth(false)}/>}
    </div>
  );
}

export default Navbar;