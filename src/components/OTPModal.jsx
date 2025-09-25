import React, { useState, useEffect } from "react";

const OTPModal = ({ isOpen, onClose, onVerify, abhaId }) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState("");

  // Helper: show OTP with fallback
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
            alert(`Your OTP is: ${newOTP}`); // fallback
          }
        });
      } else {
        alert(`Your OTP is: ${newOTP}`); // denied already
      }
    } else {
      alert(`Your OTP is: ${newOTP}`); // no Notification API
    }
  };

  useEffect(() => {
    if (isOpen) {
      setOtp("");
      setError("");
      setLoading(false);
      setResendTimer(30);
      setCanResend(false);

      // Generate random 6-digit OTP
      const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOTP(newOTP);

      // Show OTP with fallback
      showOTP(newOTP);

      // Start resend timer
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

    // Show new OTP with fallback
    showOTP(newOTP, "New OTP for Login");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-10">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 relative">
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
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
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Verify Your Identity
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            Enter the 6-digit OTP sent to your registered mobile number for
            ABHA ID: {abhaId}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="000000"
              maxLength="6"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
              loading || otp.length !== 6
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            }`}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the OTP?{" "}
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Resend OTP
              </button>
            ) : (
              <span className="text-gray-400">Resend in {resendTimer}s</span>
            )}
          </p>
        </div>

        {/* For dev/demo: always show OTP in modal too */}
        {generatedOTP && (
          <div className="mt-4 text-center">
            <p className="text-xs text-green-600 font-mono">
              OTP (debug mode): {generatedOTP}
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
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
        </button>
      </div>
    </div>
  );
};

export default OTPModal;

