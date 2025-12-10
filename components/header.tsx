"use client";

import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User, Images } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="border-b border-gray-800 bg-[#0E0E12]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Gallery Link */}
          <div className="flex-shrink-0">
            <Link href="/gallery">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <Images className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Gallery</span>
              </Button>
            </Link>
          </div>

          {/* Center: Title */}
          <div className="flex-1 text-center">
            <h1 className="text-base sm:text-xl font-bold text-white">
              Porsche Ad Builder
            </h1>
          </div>

          {/* Right: Auth */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {loading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-gray-800" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-300">
                  <User className="h-4 w-4" />
                  <span className="max-w-[150px] truncate">{user.email}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <LogOut className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <LogIn className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
