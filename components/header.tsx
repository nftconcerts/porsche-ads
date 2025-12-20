"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogIn, User, Images } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const { user, loading } = useAuth();
  const [path, setPath] = useState("");

  useEffect(() => {
    setPath(window.location.pathname);
  }, []);

  return (
    <header className="border-b border-gray-800 bg-[#0E0E12]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Gallery Link */}
          <div className="shrink-0">
            {(path !== "/gallery" && (
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
            )) || (
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <Images className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Create Your Ad</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Center: Title */}
          <div className="flex-1 text-center">
            <Link href="/">
              <h1 className="text-base sm:text-xl font-bold text-white">
                Porsche Ad Builder
              </h1>
            </Link>
          </div>

          {/* Right: Auth */}
          <div className="flex items-center gap-2 shrink-0">
            {loading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-gray-800" />
            ) : user ? (
              path === "/my-account" ? (
                <Link href="/">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    <Images className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Create an Ad</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/my-account">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    <User className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">My Account</span>
                  </Button>
                </Link>
              )
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
