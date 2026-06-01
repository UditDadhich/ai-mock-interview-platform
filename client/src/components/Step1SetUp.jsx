import React, { useState, useRef } from "react";
import { motion } from "motion/react"; // Ensure 'motion' package is correctly installed (or use 'framer-motion')
import {
  FaUserTie,
  FaBriefcase,
  FaFileUpload,
  FaMicrophoneAlt,
  FaChartLine,
  FaFile,
  FaRedoAlt,
  FaTrashAlt,
} from "react-icons/fa";
import axios from "axios";
import { ServerUrl } from "../App.jsx";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice.js";

function Step1SetUp({ onStart }) {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // Form fields
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("Technical");

  // Resume analysis states
  const [resumeFile, setResumeFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState(""); // extracted raw text from resume

  // Start interview loading state
  const [loading, setLoading] = useState(false);
  const [startError, setStartError] = useState("");

  const fileInputRef = useRef(null);

  // Reset analysis and allow re-upload
  const handleResetAnalysis = () => {
    setResumeFile(null);
    setAnalysisDone(false);
    setAnalysisError("");
    setProjects([]);
    setSkills([]);
    setResumeText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadResume = async () => {
    if (!resumeFile || analyzing) return;
    setAnalyzing(true);
    setAnalysisError("");

    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      const result = await axios.post(ServerUrl + "/api/interview/resume", formData, {
        withCredentials: true,
      });

      console.log(result.data);

      // Populate fields from analysis
      setRole(result.data.role || "");
      setExperience(result.data.experience || "");
      setProjects(result.data.projects || []);
      setSkills(result.data.skills || []);
      // IMPORTANT: assuming backend sends extracted text in 'resumeText' field
      // If not, adjust based on actual response shape
      setResumeText(result.data.resumeText || result.data.extractedText || "");
      setAnalysisDone(true);
    } catch (error) {
      console.error("Resume analysis error:", error);
      setAnalysisError(
        error.response?.data?.message || "Failed to analyze resume. Please try again."
      );
      setAnalyzing(false);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStart = async () => {
    if (!role || !experience) {
      setStartError("Please enter role and experience.");
      return;
    }
    setLoading(true);
    setStartError("");

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/generate-questions",
        { role, experience, mode, resumeText, projects, skills },
        { withCredentials: true }
      );
      if (userData) {
        dispatch(setUserData({ ...userData, credits: result.data.creditsLeft }));
      }
      setLoading(false);
      onStart(result.data);
    } catch (error) {
      console.error("Start interview error:", error);
      setStartError(
        error.response?.data?.message || "Failed to start interview. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4"
    >
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden">
        {/* Left decorative panel */}
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="relative bg-gradient-to-br from-green-50 to-green-100 p-12 flex flex-col justify-center"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Start Your AI Interview
          </h2>
          <p className="text-gray-600 mb-10">
            Practice real interview scenarios powered by AI. Improve
            communication, technical skills, and confidence.
          </p>
          <div className="space-y-5">
            {[
              {
                icon: <FaUserTie className="text-green-600 text-xl" />,
                text: "Choose Role & Experience",
              },
              {
                icon: <FaMicrophoneAlt className="text-green-600 text-xl" />,
                text: "Smart Voice Interview",
              },
              {
                icon: <FaChartLine className="text-green-600 text-xl" />,
                text: "Performance Analytics",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.15 }}
                whileHover={{ scale: 1.03 }}
                className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm cursor-pointer"
              >
                {item.icon}
                <span className="text-gray-700 font-medium">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right form panel */}
        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="p-12 bg-white"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Interview SetUp
          </h2>

          <div className="space-y-6">
            {/* Role input */}
            <div className="relative">
              <FaUserTie className="absolute top-4 left-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter role"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
                onChange={(e) => setRole(e.target.value)}
                value={role}
              />
            </div>

            {/* Experience input */}
            <div className="relative">
              <FaBriefcase className="absolute top-4 left-4 text-gray-400" />
              <input
                type="text"
                placeholder="Experience (e.g. 2 years)"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
                onChange={(e) => setExperience(e.target.value)}
                value={experience}
              />
            </div>

            {/* Mode select */}
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
            >
              <option value="Technical">Technical Interview</option>
              <option value="HR">HR Interview</option>
            </select>

            {/* Resume upload area */}
            {!analysisDone ? (
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition"
              >
                <FaFileUpload className="text-4xl mx-auto text-green-600 mb-3" />
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    setResumeFile(e.target.files[0]);
                    setAnalysisError("");
                  }}
                />
                <p className="text-gray-600 font-medium">
                  {resumeFile ? resumeFile.name : "Click to upload resume (Optional)"}
                </p>
                {resumeFile && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUploadResume();
                    }}
                    className="mt-4 bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
                    disabled={analyzing}
                  >
                    {analyzing ? "Analyzing..." : "Analyze Resume"}
                  </motion.button>
                )}
                {analysisError && (
                  <p className="text-red-500 text-sm mt-2">{analysisError}</p>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 border border-gray-300 rounded-xl p-5 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Resume Analysis Result
                  </h3>
                  <button
                    onClick={handleResetAnalysis}
                    className="text-red-500 hover:text-red-700 transition flex items-center gap-1 text-sm"
                  >
                    <FaTrashAlt /> Reset
                  </button>
                </div>

                {projects.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Projects:</p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {projects.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {skills.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s, i) => (
                        <span
                          key={i}
                          className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Start button with error display */}
            {startError && <p className="text-red-500 text-sm">{startError}</p>}
            <motion.button
              onClick={handleStart} // ✅ fixed: function, not object
              disabled={!role || !experience || loading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="w-full disabled:bg-gray-400 bg-green-600 hover:bg-green-700 text-white py-3 rounded-full text-lg font-semibold transition duration-300 shadow-md"
            >
              {loading ? "Starting..." : "Start Interview"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Step1SetUp;