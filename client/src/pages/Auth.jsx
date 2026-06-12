import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from 'axios';
import { motion } from "framer-motion"; 
import { signInWithPopup } from 'firebase/auth';

// Icons
import { BsRobot } from "react-icons/bs";
import { IoSparklesSharp } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";

// Local Imports
import { auth, provider } from "../Utils/firebase.js";
import { ServerUrl } from "../App.jsx";
import { setUserData } from "../redux/userSlice.js";

function Auth({isModel = false}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleGoogleAuth = async () => {
    try {
      setIsAuthenticating(true);

      // 1. Firebase Popup
      const response = await signInWithPopup(auth, provider);
      const { displayName: name, email } = response.user;

      // 2. Send to your Backend to create JWT Cookie
      const result = await axios.post(
        `${ServerUrl}/api/auth/google`,
        { name, email },
        { withCredentials: true }
      );

      // 3. Update Redux with user data from Database
      dispatch(setUserData(result.data));

      // 4. Move to Home page
      navigate("/");

    } catch (error) {
      console.error("Authentication failed:", error);
      dispatch(setUserData(null));
      alert("Login failed. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f3f3f3] flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white shadow-2xl border border-gray-200"
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-black text-white p-2 rounded-lg">
            <BsRobot size={18} />
          </div>
          <h2 className="font-semibold text-lg uppercase tracking-tight">InterviewIQ.AI</h2>
        </div>

        {/* Title Section */}
        <h1 className="text-2xl md:text-3xl font-bold text-center leading-tight mb-4">
          Continue with{" "}
          <span className="bg-green-100 text-green-600 px-4 py-1 rounded-full inline-flex items-center gap-2 whitespace-nowrap">
            <IoSparklesSharp size={16} />
            AI Smart Interview
          </span>
        </h1>

        <p className="text-gray-500 text-center text-sm md:text-base leading-relaxed mb-8">
          Sign in to start AI-powered mock interviews, track your progress, 
          and unlock detailed performance insights.
        </p>

        {/* Action Button */}
        <motion.button
          onClick={handleGoogleAuth}
          disabled={isAuthenticating}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center justify-center gap-3 py-3.5 
            ${isAuthenticating ? "bg-gray-400" : "bg-black"} 
            text-white rounded-full shadow-lg transition-all font-medium`}
        >
          {isAuthenticating ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Verifying...
            </div>
          ) : (
            <>
              <FcGoogle size={22} />
              Continue with Google
            </>
          )}
        </motion.button>

        <p className="mt-6 text-center text-xs text-gray-400">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}

export default Auth;
