import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const OTPModal = ({ isOpen, onClose, onVerify, abhaId }) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState("");

  const showOTP = (newOTP, title = "Your OTP for Login") => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(title, {
          body: `Your OTP is: ${newOTP}`,
          icon: "/vite.svg",
          tag: "otp-notification",
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(title, {
              body: `Your OTP is: ${newOTP}`,
              icon: "/vite.svg",
              tag: "otp-notification",
            });
          } else {
            alert(`Your OTP is: ${newOTP}`);
          }
        });
      } else {
        alert(`Your OTP is: ${newOTP}`);
      }
    } else {
      alert(`Your OTP is: ${newOTP}`);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setOtp("");
      setError("");
      setLoading(false);
      setResendTimer(30);
      setCanResend(false);

      const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOTP(newOTP);

      showOTP(newOTP);

      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    if (otp === generatedOTP) {
      onVerify();
      onClose();
    } else {
      setError("Invalid OTP. Please try again.");
    }
    setLoading(false);
  };

  const handleResend = () => {
    setResendTimer(30);
    setCanResend(false);
    setError("");

    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(newOTP);

    showOTP(newOTP, "New OTP for Login");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-medical-light-blue/20 to-medical-light-teal/20 backdrop-blur-md flex items-center justify-center z-50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-md w-full relative border border-white/30 overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-medical-light-blue via-medical-light-teal to-purple-400"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-medical-light-blue/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-medical-light-teal/10 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-purple-200/5 rounded-full blur-xl"></div>

            <div className="relative z-10 text-center mb-6">
              <motion.div
                className="mx-auto h-12 w-12 bg-gradient-to-br from-medical-light-blue to-medical-light-teal rounded-full flex items-center justify-center mb-4 shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </motion.div>
              <motion.h3
                className="text-xl font-bold bg-gradient-to-r from-medical-light-blue to-medical-light-teal bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Verify Your Identity
              </motion.h3>
              <motion.p
                className="text-sm text-gray-600 mt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Enter the 6-digit OTP sent to your registered mobile number for
                ABHA ID: <span className="font-mono text-medical-light-blue">{abhaId}</span>
              </motion.p>
            </div>

            <motion.form
              onSubmit={handleSubmit}
              className="relative z-10 space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Enter OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 6) {
                      setOtp(value);
                    }
                  }}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl text-center text-3xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-medical-light-teal focus:border-medical-light-teal transition-all duration-200 bg-white/70 backdrop-blur-sm shadow-sm"
                  placeholder="000000"
                  maxLength="6"
                />
              </div>

              {error && (
                <motion.div
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={loading || otp.length !== 6}
                className={`w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white transition-all duration-200 ${
                  loading || otp.length !== 6
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-medical-light-blue to-medical-light-teal hover:from-medical-light-teal hover:to-medical-light-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-light-teal transform hover:scale-105"
                }`}
                whileHover={!loading && otp.length === 6 ? { scale: 1.02 } : {}}
                whileTap={!loading && otp.length === 6 ? { scale: 0.98 } : {}}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </motion.button>
            </motion.form>

            <motion.div
              className="relative z-10 mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <p className="text-sm text-gray-600">
                Didn't receive the OTP?{" "}
                {canResend ? (
                  <motion.button
                    onClick={handleResend}
                    className="text-medical-light-blue hover:text-medical-light-teal font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Resend OTP
                  </motion.button>
                ) : (
                  <span className="text-gray-400">Resend in {resendTimer}s</span>
                )}
              </p>
            </motion.div>

            {generatedOTP && (
              <motion.div
                className="relative z-10 mt-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <p className="text-xs text-green-600 font-mono bg-green-50 px-2 py-1 rounded">
                  OTP (debug mode): {generatedOTP}
                </p>
              </motion.div>
            )}

            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OTPModal;

