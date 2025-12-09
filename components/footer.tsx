"use client";
import React, { useState } from "react";
import Link from "next/link";

const Footer = () => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="bg-black text-gray-500 text-sm w-full flex items-center justify-center py-4 "
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered ? (
        <Link
          href="https://jimmygpt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-normal"
        >
          A JimmyGPT Joint
        </Link>
      ) : (
        <>
          {" "}
          Copyright {new Date().getFullYear()} p-ads.com. All Rights Reserved.
        </>
      )}
    </div>
  );
};

export default Footer;
