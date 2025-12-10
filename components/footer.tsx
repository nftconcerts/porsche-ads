"use client";
import React, { useState } from "react";
import Link from "next/link";

const Footer = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="bg-black text-gray-500 text-sm w-full py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Mobile: Stack vertically */}
        <div className="flex flex-col gap-3 sm:hidden">
          <div className="flex items-center justify-center gap-4">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
          <div
            className="text-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {hovered ? (
              <Link
                href="https://jimmygpt.com"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-normal hover:text-white transition-colors"
              >
                A JimmyGPT Joint
              </Link>
            ) : (
              <span>
                Copyright {new Date().getFullYear()} p-ads.com. All Rights
                Reserved.
              </span>
            )}
          </div>
        </div>

        {/* Desktop: Three columns */}
        <div className="hidden sm:flex items-center justify-between gap-2">
          {/* Left: Terms */}
          <div className="flex-shrink-0">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>

          {/* Center: Copyright with JimmyGPT easter egg */}
          <div
            className="flex-1 text-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {hovered ? (
              <Link
                href="https://jimmygpt.com"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-normal hover:text-white transition-colors"
              >
                A JimmyGPT Joint
              </Link>
            ) : (
              <span>
                Copyright {new Date().getFullYear()} p-ads.com. All Rights
                Reserved.
              </span>
            )}
          </div>

          {/* Right: Privacy */}
          <div className="flex-shrink-0">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
