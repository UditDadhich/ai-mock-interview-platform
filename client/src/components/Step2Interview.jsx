import React, { useEffect, useState, useRef, useCallback } from "react";
import maleVideo from "../assets/videos/male-ai.mp4";
import femaleVideo from "../assets/videos/female-ai.mp4";
import Timer from "./Timer.jsx";
import { motion } from "framer-motion";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { BsArrowRight } from "react-icons/bs";
import axios from "axios";
import { ServerUrl } from "../App.jsx";


function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, questions, userName } = interviewData;

  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  // Refs to track latest state values inside async callbacks (avoids stale closures)
  const isMicOnRef = useRef(isMicOn);
  const isListeningRef = useRef(false); // tracks actual mic running state
  const isSubmittingRef = useRef(false);
  const answerRef = useRef(answer);
  const isMountedRef = useRef(true);

  // Keep refs in sync with state
  useEffect(() => { isMicOnRef.current = isMicOn; }, [isMicOn]);
  useEffect(() => { answerRef.current = answer; }, [answer]);
  useEffect(() => { isSubmittingRef.current = isSubmitting; }, [isSubmitting]);

  const currentQuestion = questions[currentIndex];
  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  // ─── Mic helpers ────────────────────────────────────────────────────────────

  const startMic = useCallback(() => {
    if (!recognitionRef.current || isListeningRef.current) return;
    try {
      recognitionRef.current.start();
      isListeningRef.current = true;
    } catch (_) {
      // Already started or not available — silently ignore
    }
  }, []);

  const stopMic = useCallback(() => {
    if (!recognitionRef.current || !isListeningRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (_) {}
    isListeningRef.current = false;
  }, []);

  const toggleMic = useCallback(() => {
    setIsMicOn((prev) => {
      const next = !prev;
      isMicOnRef.current = next;
      if (next) startMic();
      else stopMic();
      return next;
    });
  }, [startMic, stopMic]);

  // ─── Speech synthesis ────────────────────────────────────────────────────────

  const speakText = useCallback(
    (text) => {
      return new Promise((resolve) => {
        if (!window.speechSynthesis || !selectedVoice) {
          resolve();
          return;
        }
        window.speechSynthesis.cancel();

        const humanText = text.replace(/,/g, ", ... ").replace(/\./g, ". ...");
        const utterance = new SpeechSynthesisUtterance(humanText);
        utterance.voice = selectedVoice;
        utterance.rate = 0.92;
        utterance.pitch = 1.05;
        utterance.volume = 1;

        utterance.onstart = () => {
          if (!isMountedRef.current) return;
          setIsAIPlaying(true);
          stopMic();
          videoRef.current?.play();
        };

        utterance.onend = () => {
          if (!isMountedRef.current) {
            resolve();
            return;
          }
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
          }
          setIsAIPlaying(false);
          // Use ref to get the latest mic preference, not stale closure value
          if (isMicOnRef.current) startMic();
          setTimeout(() => {
            if (isMountedRef.current) setSubtitle("");
            resolve();
          }, 300);
        };

        utterance.onerror = () => {
          if (isMountedRef.current) setIsAIPlaying(false);
          resolve();
        };

        setSubtitle(text);
        window.speechSynthesis.speak(utterance);
      });
    },
    [selectedVoice, startMic, stopMic]
  );

  // ─── Voice loading ───────────────────────────────────────────────────────────

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const femaleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("female")
      );
      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }
      const maleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male")
      );
      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }
      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // ─── Speech recognition setup ────────────────────────────────────────────────

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript;
      setAnswer((prev) => prev + " " + transcript);
    };

    recognition.onend = () => {
      // Auto-restart if mic should still be on and AI is not speaking
      isListeningRef.current = false;
      if (isMicOnRef.current && !isSubmittingRef.current) {
        // Small delay to avoid rapid restart loop
        setTimeout(() => {
          if (isMicOnRef.current && isMountedRef.current) {
            startMic();
          }
        }, 200);
      }
    };

    recognition.onerror = (e) => {
      isListeningRef.current = false;
      if (e.error === "aborted" || e.error === "no-speech") return;
      console.error("Speech recognition error:", e.error);
    };

    recognitionRef.current = recognition;
  }, [startMic]);

  // ─── Intro + question speech sequence ────────────────────────────────────────

  useEffect(() => {
    if (!selectedVoice) return;

    let cancelled = false;

    const run = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready`
        );
        if (cancelled) return;
        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
        );
        if (cancelled) return;
        setIsIntroPhase(false);
      } else if (currentQuestion) {
        await new Promise((r) => setTimeout(r, 800));
        if (cancelled) return;
        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging");
          if (cancelled) return;
        }
        await speakText(currentQuestion.question);
        if (cancelled) return;
        if (isMicOnRef.current) startMic();
      }
    };

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVoice, isIntroPhase, currentIndex]);

  // ─── Timer countdown ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (isIntroPhase || !currentQuestion || isSubmitting) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isIntroPhase, currentIndex, isSubmitting]);

  // ─── Auto-submit when time runs out ──────────────────────────────────────────

  useEffect(() => {
    if (isIntroPhase || !currentQuestion) return;
    if (timeLeft === 0 && !isSubmittingRef.current && !feedback) {
      submitAnswer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // ─── Submit answer ────────────────────────────────────────────────────────────

  const submitAnswer = async () => {
    if (isSubmittingRef.current) return;
    setIsSubmitting(true);
    stopMic();

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/submit-answer",
        {
          interviewId,
          questionIndex: currentIndex,
          answer: answerRef.current, // use ref to get latest value
          timeTaken: currentQuestion.timeLimit - timeLeft,
        },
        { withCredentials: true }
      );
      if (!isMountedRef.current) return;
      setFeedback(result.data.feedback);
      await speakText(result.data.feedback);
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  };

  // ─── Handle next question ────────────────────────────────────────────────────

  const handleNext = async () => {
    if (currentIndex + 1 === questions.length) {
      finishInterview();
      return;
    }

    const nextIndex = currentIndex + 1;
    setFeedback("");
    setAnswer("");
    await speakText("Alright, let's move on to the next question.");

    if (!isMountedRef.current) return;
    setCurrentIndex(nextIndex);
    setTimeLeft(questions[nextIndex]?.timeLimit || 60);
  };

  // ─── Finish interview ────────────────────────────────────────────────────────

  const finishInterview = async () => {
    stopMic();
    setIsMicOn(false);
    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/finish",
        { interviewId },
        { withCredentials: true }
      );
      onFinish(result.data);
    } catch (error) {
      console.error("Error finishing interview:", error);
    }
  };

  // ─── Cleanup on unmount ───────────────────────────────────────────────────────

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopMic();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }
      window.speechSynthesis.cancel();
    };
  }, [stopMic]);

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden">

        {/* ── Video Section ── */}
        <div className="w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200">
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl">
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="w-full h-auto object-cover"
            />
          </div>

          {subtitle && (
            <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed">
                {subtitle}
              </p>
            </div>
          )}

          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Interview Status</span>
              {isAIPlaying && (
                <span className="text-sm font-semibold text-emerald-600">
                  AI Speaking
                </span>
              )}
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex justify-center">
              <Timer
                timeLeft={timeLeft}
                totalTime={currentQuestion?.timeLimit || 60}
              />
            </div>
            <div className="h-px bg-gray-200" />
            <div className="grid grid-cols-2 gap-6 text-center">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-emerald-600">
                  {currentIndex + 1}
                </span>
                <span className="text-xs text-gray-400">Current Question</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-emerald-600">
                  {questions.length}
                </span>
                <span className="text-xs text-gray-400">Total Questions</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Text / Answer Section ── */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative">
          <h2 className="text-xl sm:text-2xl font-bold text-emerald-600 mb-6">
            AI Smart Interview
          </h2>

          {!isIntroPhase && (
            <div className="relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-xs sm:text-sm text-gray-400 mb-2">
                Question {currentIndex + 1} of {questions.length}
              </p>
              <div className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed">
                {currentQuestion?.question}
              </div>
            </div>
          )}

          <textarea
            placeholder="Type your answer here..."
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            className="flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800"
          />

          {!feedback ? (
            <div className="flex items-center gap-4 mt-6">
              <motion.button
                onClick={toggleMic}
                whileTap={{ scale: 0.9 }}
                title={isMicOn ? "Mute microphone" : "Unmute microphone"}
                className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-black text-white shadow-lg flex-shrink-0"
              >
                {isMicOn ? (
                  <FaMicrophone size={20} />
                ) : (
                  <FaMicrophoneSlash size={20} />
                )}
              </motion.button>

              <motion.button
                onClick={submitAnswer}
                disabled={isSubmitting}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm"
            >
              <p className="text-emerald-700 font-medium mb-4">{feedback}</p>
              <button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-2xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                {currentIndex + 1 === questions.length
                  ? "Finish Interview"
                  : "Next Question"}
                <BsArrowRight size={18} />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Step2Interview;
