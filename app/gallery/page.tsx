"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Footer from "@/components/footer";

// Example gallery images - replace these with your actual example URLs
const GALLERY_IMAGES = [
  {
    id: 1,
    src: "https://imagedelivery.net/rVtfhuW6Th7mqwAJAWfhBA/b75b2c71-28c3-4585-dbfd-a8c1dcc56b00/large",
    alt: "911 Classic Ad",
  },
  {
    id: 2,
    src: "https://imagedelivery.net/rVtfhuW6Th7mqwAJAWfhBA/f2efed24-275d-49d3-646e-605d19717e00/large",
    alt: "911 Turbo S Ad",
  },
  {
    id: 3,
    src: "https://imagedelivery.net/rVtfhuW6Th7mqwAJAWfhBA/9580d48a-f284-4d82-e726-4b076ce0fb00/large",
    alt: "GT3 Ad",
  },
  {
    id: 4,
    src: "https://imagedelivery.net/rVtfhuW6Th7mqwAJAWfhBA/a11bcabe-6133-4aab-3938-5708981b3500/large",
    alt: "Magic Everyday",
  },
  {
    id: 5,
    src: "https://imagedelivery.net/rVtfhuW6Th7mqwAJAWfhBA/76644dc2-fe18-42e7-681e-b05470d2c000/large",
    alt: "Any Car in the World",
  },
  {
    id: 6,
    src: "https://imagedelivery.net/rVtfhuW6Th7mqwAJAWfhBA/fe60a867-806a-41cb-9b13-cfebb53ba100/large",
    alt: "Green is Good",
  },
  {
    id: 7,
    src: "https://imagedelivery.net/rVtfhuW6Th7mqwAJAWfhBA/3a260054-8840-41fc-1ec3-e885800c6e00/large",
    alt: "Driven by Dreams",
  },
  {
    id: 8,
    src: "https://imagedelivery.net/rVtfhuW6Th7mqwAJAWfhBA/f2efed24-275d-49d3-646e-605d19717e00/large",
    alt: "Driven by Dreams",
  },
  {
    id: 9,
    src: "https://imagedelivery.net/rVtfhuW6Th7mqwAJAWfhBA/75a4b247-5717-4a43-d2b1-8bcabe870700/large",
    alt: "2 Points is Curve",
  },
];

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<
    (typeof GALLERY_IMAGES)[0] | null
  >(null);

  const handleImageClick = (image: (typeof GALLERY_IMAGES)[0]) => {
    setSelectedImage(image);
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-[#0E0E12] text-white">
      <Header />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Gallery</h1>
          <p className="text-gray-400">Example Ads created on p-ads.com</p>
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {GALLERY_IMAGES.map((image) => (
            <div
              key={image.id}
              className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-lg bg-gray-800 transition-transform hover:scale-[1.02]"
              onClick={() => handleImageClick(image)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-auto object-cover"
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  Click to view
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {GALLERY_IMAGES.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              No examples yet. Check back soon!
            </p>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Close Button */}
          <Button
            onClick={handleClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Image Container with Watermark */}
          <div
            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={handleClose}
            onContextMenu={(e) => e.preventDefault()}
          >
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="w-full max-h-[90vh] object-contain select-none"
              draggable={false}
              onClick={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
            />

            {/* Watermark Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="text-white/20 text-6xl sm:text-8xl font-bold transform rotate-[-30deg] select-none">
                p-ads.com
              </div>
            </div>

            {/* Protection overlay - prevents right-click/download attempts */}
            <div className="absolute inset-0 bg-transparent" />
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-sm">
            Click anywhere to close
          </div>
        </div>
      )}

      <style jsx>{`
        img::selection {
          background: transparent;
        }
        img::-moz-selection {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
