import React, { useState } from "react";
import { AdminProfile, loginAdmin } from "../../lib/authService";

interface LoginViewProps {
  loginEmail: string;
  setLoginEmail: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  loginError: string;
  setLoginError: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  setIsLoggedIn: (val: boolean) => void;
  onLoginSuccess: (profile: AdminProfile) => void;
}

export default function LoginView({
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  loginError,
  setLoginError,
  showPassword,
  setShowPassword,
  setIsLoggedIn,
  onLoginSuccess,
}: LoginViewProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    try {
      const profile = await loginAdmin(loginEmail, loginPassword);
      onLoginSuccess(profile);
      setIsLoggedIn(true);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f3f8fc] p-4 text-center select-none font-sans">
      <div className="flex flex-col items-center w-full max-w-sm mt-4">
        {/* Uploaded Logo */}
        <img src="/icons/login.png" alt="Tayabas TODA Go Logo" className="w-24 h-auto object-contain mt-10 mb-5" />

        {/* Welcome Headers */}
        <h2 className="text-[#091b6f] font-extrabold text-[28px] tracking-tight mt-10 mb-1">
          Welcome Admin
        </h2>
        <p className="text-[#091b6f]/80 text-sm font-medium mb-8">
          Log in to your admin account
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5" autoComplete="off">
          {/* Email Field */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[#091b6f] text-sm font-medium self-start pl-1">
              Email
            </label>
            <div className="bg-[#091b6f] text-white rounded-xl flex items-center px-4 py-3.5 w-full transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80 mr-3 shrink-0">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                type="email"
                placeholder="Enter your email"
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value);
                  if (loginError) setLoginError("");
                }}
                className="bg-transparent border-none outline-none text-white placeholder-white/50 text-sm font-semibold w-full"
                style={{ backgroundColor: "transparent", color: "white" }}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[#091b6f] text-sm font-medium self-start pl-1">
              Password
            </label>
            <div className="bg-[#091b6f] text-white rounded-xl flex items-center px-4 py-3.5 w-full transition-all relative">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80 mr-3 shrink-0">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(e) => {
                  setLoginPassword(e.target.value);
                  if (loginError) setLoginError("");
                }}
                className="bg-transparent border-none outline-none text-white placeholder-white/50 text-sm font-semibold w-full pr-10"
                style={{ backgroundColor: "transparent", color: "white" }}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-white/70 hover:text-white transition-colors cursor-pointer"
                aria-label="Toggle Password Visibility"
              >
                {!showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {loginError && (
            <p className="text-rose-600 text-xs font-bold text-center">
              {loginError}
            </p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`${isLoading
                ? "bg-[#5b7af5]/70 cursor-not-allowed"
                : "bg-[#5b7af5] hover:bg-[#4f73f6] active:bg-blue-700 cursor-pointer"
              } text-white font-extrabold text-base py-4 px-6 rounded-xl w-full shadow-sm hover:shadow transition-all mt-4`}
          >
            {isLoading ? "Authenticating..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
