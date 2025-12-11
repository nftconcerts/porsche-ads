"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Lockscreen() {
  const pathname = usePathname();
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState(false);

  // Don't show lockscreen for legal pages
  const isPublicRoute = pathname === "/terms" || pathname === "/privacy";

  useEffect(() => {
    // Check if already unlocked in this session
    const unlocked = sessionStorage.getItem("app_unlocked");
    if (unlocked === "true") {
      setIsUnlocked(true);
    }
  }, []);

  useEffect(() => {
    // Hide scrollbar when lockscreen is active
    if (!isUnlocked && !isPublicRoute) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isUnlocked, isPublicRoute]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "trade4gt3") {
      sessionStorage.setItem("app_unlocked", "true");
      setIsUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setPassword("");
    }
  };

  if (isUnlocked || isPublicRoute) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://imagedelivery.net/rVtfhuW6Th7mqwAJAWfhBA/434485ae-e7a5-4403-8129-93a6478d4e00/large')",
        }}
      />
      {/* Black Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Password Form */}
      <div className="relative z-10 w-full max-w-md px-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Porsche Ad Builder
            </h1>
            <p className="text-gray-300 text-sm">Enter password to continue</p>
          </div>

          <div className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Enter password"
              className={`h-12 text-center text-lg bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-white/40 transition-all ${
                error ? "border-red-500 shake" : ""
              }`}
              autoFocus
            />
            {error && (
              <p className="text-red-400 text-sm text-center animate-in fade-in">
                Incorrect password
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg bg-white text-black hover:bg-gray-200 transition-all font-semibold"
          >
            Unlock
          </Button>
        </form>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }
        .shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
