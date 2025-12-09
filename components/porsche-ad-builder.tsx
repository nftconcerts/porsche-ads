"use client";

import type React from "react";

import { useState, useRef, useCallback } from "react";
import { FileUploader } from "react-drag-drop-files";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Download,
  Mail,
  Upload,
  Smartphone,
  Square,
  Maximize2,
} from "lucide-react";
import { PORSCHE_TAGLINES } from "@/lib/porsche-taglines";
import { PRODUCTS } from "@/lib/products";
import CheckoutModal from "./checkout-modal";
import { useToast } from "@/hooks/use-toast";
import * as htmlToImage from "html-to-image";

const FILE_TYPES = ["JPG", "JPEG", "PNG", "WEBP"];
const MAX_FILE_SIZE = 10; // in MB

type FormatType = "mobile" | "square" | "poster";

const FORMATS = {
  mobile: {
    name: "Mobile Story",
    width: 2160,
    height: 3840,
    aspectRatio: "9/16",
    frame: "/images/p-ad-2160x3840.png",
    icon: Smartphone,
  },
  square: {
    name: "Square Post",
    width: 3600,
    height: 3600,
    aspectRatio: "1/1",
    frame: "/images/p-ad-3600x3600.png",
    icon: Square,
  },
  poster: {
    name: "Classic Poster",
    width: 3600,
    height: 2400,
    aspectRatio: "3/2",
    frame: "/images/p-ad-3600x2400.png",
    icon: Maximize2,
  },
};

export default function PorscheAdBuilder() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState(1.5);
  const [fontSize, setFontSize] = useState(1.8);
  const [format, setFormat] = useState<FormatType>("poster"); // Added format state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [textDragStart, setTextDragStart] = useState({ x: 0, y: 0 });
  const [selectedTagline, setSelectedTagline] = useState<string>(
    PORSCHE_TAGLINES[0]
  );
  const [customTagline, setCustomTagline] = useState("");
  const [useCustomTagline, setUseCustomTagline] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const currentFormat = FORMATS[format]; // Get current format config

  const handleFileChange = useCallback((file: File | File[]) => {
    // Handle single file or array of files - take the first file if array
    const selectedFile = Array.isArray(file) ? file[0] : file;

    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setImagePosition({ x: 0, y: 0 });
      setImageScale(1.5);
      setFontSize(1.8);
    };
    reader.readAsDataURL(selectedFile);
  }, []);

  const handleFileError = useCallback(
    (error: string) => {
      if (error.includes("size")) {
        toast({
          title: "File Too Large",
          description: `Please upload an image smaller than ${MAX_FILE_SIZE}MB`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Upload Error",
          description: "Please upload a valid image file (JPG, PNG, or WEBP)",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!uploadedImage) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
    if (isDraggingText) {
      handleTextMouseMove(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsDraggingText(false);
  };

  const handleTextMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent image dragging when clicking on text
    setIsDraggingText(true);
    setTextDragStart({
      x: e.clientX - textPosition.x,
      y: e.clientY - textPosition.y,
    });
  };

  const handleTextMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingText) return;
    e.stopPropagation();
    setTextPosition({
      x: e.clientX - textDragStart.x,
      y: e.clientY - textDragStart.y,
    });
  };

  // Touch handlers for mobile support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!uploadedImage) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - imagePosition.x,
      y: touch.clientY - imagePosition.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      setImagePosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
    if (isDraggingText) {
      handleTextTouchMove(e);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setIsDraggingText(false);
  };

  const handleTextTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.touches[0];
    setIsDraggingText(true);
    setTextDragStart({
      x: touch.clientX - textPosition.x,
      y: touch.clientY - textPosition.y,
    });
  };

  const handleTextTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingText) return;
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    setTextPosition({
      x: touch.clientX - textDragStart.x,
      y: touch.clientY - textDragStart.y,
    });
  };

  const exportToJPG = useCallback(async () => {
    if (!canvasRef.current || !uploadedImage) return;

    try {
      toast({
        title: "Generating Image...",
        description: "Please wait while we export your ad",
      });

      const displayWidth = canvasRef.current.offsetWidth;
      const displayHeight = canvasRef.current.offsetHeight;
      const targetWidth = currentFormat.width;
      const targetHeight = currentFormat.height;
      const pixelRatio = Math.max(
        targetWidth / displayWidth,
        targetHeight / displayHeight
      );

      console.log("[v0] Export settings:", {
        displaySize: `${displayWidth}x${displayHeight}`,
        targetSize: `${targetWidth}x${targetHeight}`,
        pixelRatio: pixelRatio.toFixed(2),
        format,
      });

      // Use html-to-image to capture the exact DOM rendering at high resolution
      const dataUrl = await htmlToImage.toJpeg(canvasRef.current, {
        quality: 0.98, // Increased from 0.95 to 0.98 for better quality
        pixelRatio: pixelRatio,
        cacheBust: true,
        backgroundColor: "#ffffff",
        skipFonts: true, // Prevents CORS errors from external font stylesheets
      });

      console.log("[v0] Export complete, image generated");

      // Download the image
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `porsche-ad-${format}-${targetWidth}x${targetHeight}.jpg`;
      a.click();

      toast({
        title: "Success!",
        description: `High-resolution ${targetWidth}x${targetHeight} image exported`,
      });
    } catch (error) {
      console.error("[v0] Export failed:", error);
      toast({
        title: "Export Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  }, [uploadedImage, format, currentFormat, toast]);

  const handleCheckoutSuccess = () => {
    if (checkoutProduct === "jpg-export") {
      exportToJPG();
      toast({
        title: "Download Started",
        description: "Your Porsche ad is being downloaded",
      });
    } else {
      toast({
        title: "Order Confirmed",
        description: "Your print will be mailed to you soon",
      });
    }
  };

  const displayTagline = useCustomTagline ? customTagline : selectedTagline;

  const handleExportClick = (productId: string, e: React.MouseEvent) => {
    if (e.shiftKey) {
      console.log("[v0] Dev mode: Bypassing payment for testing");
      if (productId === "jpg-export") {
        exportToJPG();
        toast({
          title: "Dev Mode: Download Started",
          description: "Testing JPG export without payment",
        });
      } else {
        toast({
          title: "Dev Mode: Print Order Simulated",
          description: "Testing print order flow without payment",
        });
      }
      return;
    }

    setCheckoutProduct(productId);
  };

  return (
    <div className="min-h-screen p-6 bg-[#0E0E12]">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className="mb-2 font-arial text-4xl font-bold tracking-tight text-white">
            Porsche Ad Builder
          </h1>
          <p className="text-gray-300">
            Create your own classic Porsche advertisement
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
          <div className="space-y-6">
            <Card className="p-4">
              <Label className="mb-3 block text-sm font-semibold">
                Select Format
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {(
                  Object.entries(FORMATS) as [
                    FormatType,
                    typeof FORMATS.mobile
                  ][]
                ).map(([key, fmt]) => {
                  const Icon = fmt.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setFormat(key)}
                      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:bg-accent ${
                        format === key
                          ? "border-primary bg-accent"
                          : "border-border"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-xs font-medium text-center">
                        {fmt.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card
              className="overflow-hidden p-0 bg-transparent border-0 shadow-2xl w-full sm:max-h-[80vh] sm:min-h-[300px] mx-auto"
              style={{ aspectRatio: currentFormat.aspectRatio }}
            >
              {!uploadedImage ? (
                <FileUploader
                  handleChange={handleFileChange}
                  name="file"
                  types={FILE_TYPES}
                  maxSize={MAX_FILE_SIZE}
                  onSizeError={handleFileError}
                  onTypeError={handleFileError}
                >
                  <div
                    className="relative w-full"
                    style={{ aspectRatio: currentFormat.aspectRatio }}
                  >
                    <img
                      src={currentFormat.frame || "/placeholder.svg"}
                      alt="Porsche Frame"
                      className="absolute inset-0 w-full h-full pointer-events-none object-cover opacity-20"
                    />

                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm">
                      <Upload className="h-16 w-16 text-white/50" />
                      <div className="text-center">
                        <p className="text-xl font-semibold mb-2 text-white">
                          Drop your Porsche here
                        </p>
                        <p className="text-gray-300">
                          or click to browse files
                        </p>
                      </div>
                    </div>
                  </div>
                </FileUploader>
              ) : (
                <div
                  ref={canvasRef}
                  className="relative w-full cursor-move select-none overflow-hidden bg-gray-200 touch-none"
                  style={{ aspectRatio: currentFormat.aspectRatio }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <img
                    src={uploadedImage || "/placeholder.svg"}
                    alt="Your car"
                    className="absolute inset-0 w-full h-full pointer-events-none object-contain z-10"
                    style={{
                      transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale})`,
                      transformOrigin: "center center",
                    }}
                    draggable={false}
                  />

                  <img
                    src={currentFormat.frame || "/placeholder.svg"}
                    alt="Porsche Frame"
                    className="absolute inset-0 w-full h-full pointer-events-none object-cover z-20"
                  />

                  <div className="absolute inset-0 z-30">
                    <div
                      className="absolute p-4 sm:p-8 md:p-12 pb-16 sm:pb-32 md:pb-44 pl-8 sm:pl-20 md:pl-28 pointer-events-auto cursor-move select-none touch-none"
                      style={{
                        transform: `translate(${textPosition.x}px, ${textPosition.y}px)`,
                        bottom: 0,
                        left: 0,
                      }}
                      onMouseDown={handleTextMouseDown}
                      onTouchStart={handleTextTouchStart}
                    >
                      <p
                        className="font-porsche font-bold leading-tight text-foreground text-balance max-w-2xl"
                        style={{ fontSize: `${fontSize}rem` }}
                      >
                        {displayTagline}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {uploadedImage && (
              <Card className="p-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Image Scale</Label>
                      <span className="text-sm text-muted-foreground">
                        {imageScale.toFixed(2)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.01"
                      value={imageScale}
                      onChange={(e) =>
                        setImageScale(Number.parseFloat(e.target.value))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black hover:accent-gray-800"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Text Size</Label>
                      <span className="text-sm text-muted-foreground">
                        {fontSize.toFixed(1)}rem
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="4"
                      step="0.1"
                      value={fontSize}
                      onChange={(e) =>
                        setFontSize(Number.parseFloat(e.target.value))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black hover:accent-gray-800"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setImagePosition({ x: 0, y: 0 });
                        setImageScale(1.5);
                        setFontSize(1.8);
                        setTextPosition({ x: 0, y: 0 });
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Reset All
                    </Button>
                    <Button
                      onClick={() => {
                        setUploadedImage(null);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Change Image
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="mb-4 font-semibold text-lg">Choose Tagline</h2>

              <div className="mb-4">
                <RadioGroup
                  value={useCustomTagline ? "custom" : "preset"}
                  onValueChange={(value) =>
                    setUseCustomTagline(value === "custom")
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="preset" id="preset" />
                    <Label htmlFor="preset">Classic Porsche Lines</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom">Write Your Own</Label>
                  </div>
                </RadioGroup>
              </div>

              {!useCustomTagline ? (
                <RadioGroup
                  value={selectedTagline}
                  onValueChange={setSelectedTagline}
                >
                  <div className="space-y-3">
                    {PORSCHE_TAGLINES.map((tagline) => (
                      <div
                        key={tagline}
                        className="flex items-start space-x-2 text-xl"
                      >
                        <RadioGroupItem
                          value={tagline}
                          id={tagline}
                          className="mt-1"
                        />
                        <Label
                          htmlFor={tagline}
                          className="cursor-pointer font-normal leading-relaxed"
                        >
                          {tagline}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <Input
                  value={customTagline}
                  onChange={(e) => setCustomTagline(e.target.value)}
                  placeholder="What makes your Porsche special?"
                  className="w-full"
                />
              )}
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 font-semibold text-lg">Export Your Ad</h2>
              <div className="space-y-3">
                <Button
                  onClick={(e) => handleExportClick("jpg-export", e)}
                  disabled={!uploadedImage}
                  className="w-full"
                  size="lg"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Digital Download - $
                  {(PRODUCTS[0].priceInCents / 100).toFixed(2)}
                </Button>
                <Button
                  onClick={(e) => handleExportClick("print-mail", e)}
                  disabled={!uploadedImage}
                  variant="secondary"
                  className="w-full"
                  size="lg"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Premium Print & Ship - $
                  {(PRODUCTS[1].priceInCents / 100).toFixed(2)}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Dev tip: Shift+click to test without payment
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {checkoutProduct && (
        <CheckoutModal
          isOpen={!!checkoutProduct}
          onClose={() => setCheckoutProduct(null)}
          productId={checkoutProduct}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
}
