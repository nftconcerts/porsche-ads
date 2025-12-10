"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { FileUploader } from "react-drag-drop-files";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Download,
  Upload,
  Smartphone,
  Square,
  Maximize2,
  Car,
} from "lucide-react";
import { PORSCHE_TAGLINES } from "@/lib/porsche-taglines";
import { PRODUCTS } from "@/lib/products";
import CheckoutModal from "./checkout-modal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { verifyExportAccess } from "@/app/actions/verify-export";
import { getUserCredits } from "@/lib/user-credits";
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
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState(1.5);
  const [fontSize, setFontSize] = useState(2.5);
  const [format, setFormat] = useState<FormatType>("poster"); // Added format state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [textDragStart, setTextDragStart] = useState({ x: 0, y: 0 });
  const [lastPinchDistance, setLastPinchDistance] = useState<number | null>(
    null
  );
  const [lastTextPinchDistance, setLastTextPinchDistance] = useState<
    number | null
  >(null);
  const [selectedTagline, setSelectedTagline] = useState<string>(
    PORSCHE_TAGLINES[0]
  );
  const [customTagline, setCustomTagline] = useState("");
  const [useCustomTagline, setUseCustomTagline] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [hasSubscription, setHasSubscription] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const canvasRef = useRef<HTMLDivElement>(null);

  const currentFormat = FORMATS[format]; // Get current format config

  // Fetch user credits when user is authenticated
  useEffect(() => {
    if (user) {
      getUserCredits(user.uid).then((data) => {
        setUserCredits(data.credits);
        setHasSubscription(data.subscriptionActive);
      });
    }
  }, [user]);

  // Track window width for responsive text positioning
  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

    if (e.touches.length === 2) {
      // Two fingers - start pinch gesture
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      setLastPinchDistance(distance);
    } else if (e.touches.length === 1) {
      // One finger - start drag
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - imagePosition.x,
        y: touch.clientY - imagePosition.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastPinchDistance !== null) {
      // Two fingers - pinch to zoom
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / lastPinchDistance;
      const newScale = Math.min(3, Math.max(0.5, imageScale * scale));
      setImageScale(newScale);
      setLastPinchDistance(currentDistance);
    } else if (isDragging && e.touches.length === 1) {
      // One finger - drag
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
    setLastPinchDistance(null);
    setLastTextPinchDistance(null);
  };

  const handleTextTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();

    if (e.touches.length === 2) {
      // Two fingers - start pinch gesture for text
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      setLastTextPinchDistance(distance);
    } else if (e.touches.length === 1) {
      // One finger - start drag
      const touch = e.touches[0];
      setIsDraggingText(true);
      setTextDragStart({
        x: touch.clientX - textPosition.x,
        y: touch.clientY - textPosition.y,
      });
    }
  };

  const handleTextTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTextPinchDistance !== null) {
      // Two fingers - pinch to zoom text
      e.preventDefault();
      e.stopPropagation();
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / lastTextPinchDistance;
      const newFontSize = Math.min(4, Math.max(0.8, fontSize * scale));
      setFontSize(newFontSize);
      setLastTextPinchDistance(currentDistance);
    } else if (isDraggingText && e.touches.length === 1) {
      // One finger - drag text
      e.preventDefault();
      e.stopPropagation();
      const touch = e.touches[0];
      setTextPosition({
        x: touch.clientX - textDragStart.x,
        y: touch.clientY - textDragStart.y,
      });
    }
  };

  // // Scroll to zoom on desktop
  // const handleWheel = (e: React.WheelEvent) => {
  //   if (!uploadedImage) return;
  //   e.preventDefault();
  //   const delta = e.deltaY * -0.001;
  //   const newScale = Math.min(3, Math.max(0.5, imageScale + delta));
  //   setImageScale(newScale);
  // };

  // // Scroll to zoom text on desktop
  // const handleTextWheel = (e: React.WheelEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   const delta = e.deltaY * -0.002; // Slightly more sensitive for text
  //   const newFontSize = Math.min(4, Math.max(0.8, fontSize + delta));
  //   setFontSize(newFontSize);
  // };

  // Helper function to calculate distance between two touches
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const exportToJPG = useCallback(
    async (skipCreditCheck = false) => {
      if (!canvasRef.current || !uploadedImage) return;

      // Check credits unless explicitly skipping (for dev mode or post-purchase)
      if (!skipCreditCheck && user) {
        const accessResult = await verifyExportAccess(user.uid);
        if (!accessResult.allowed) {
          toast({
            title: "Export Not Allowed",
            description:
              accessResult.reason ||
              "You need to purchase credits or a subscription",
            variant: "destructive",
          });
          return;
        }
        // Update local credits state
        if (accessResult.credits !== undefined && accessResult.credits >= 0) {
          setUserCredits(accessResult.credits);
        }
      }

      // Detect iOS Safari (which has html-to-image issues with images)
      const isIOS =
        typeof navigator !== "undefined" &&
        /iPad|iPhone|iPod/.test(navigator.userAgent);

      try {
        toast({
          title: "Generating Image...",
          description: "Please wait while we export your ad",
        });

        const displayWidth = canvasRef.current.offsetWidth;
        const displayHeight = canvasRef.current.offsetHeight;
        const targetWidth = currentFormat.width;
        const targetHeight = currentFormat.height;

        // Calculate pixel ratio with iOS safety caps
        let pixelRatio = Math.max(
          targetWidth / displayWidth,
          targetHeight / displayHeight
        );

        // iOS Safari has issues with large pixel ratios and data URL images
        if (isIOS) {
          pixelRatio = Math.min(pixelRatio, 1.5); // Cap at 1.5x for iOS stability
        }

        console.log("[v0] Export settings:", {
          displaySize: `${displayWidth}x${displayHeight}`,
          targetSize: `${targetWidth}x${targetHeight}`,
          pixelRatio: pixelRatio.toFixed(2),
          format,
          isIOS,
        });

        // iOS Safari workaround: do a warm-up render first
        const doRender = () =>
          htmlToImage.toJpeg(canvasRef.current!, {
            quality: 0.98,
            pixelRatio: pixelRatio,
            cacheBust: true,
            backgroundColor: "#ffffff",
            skipFonts: true,
            // Additional iOS-specific options
            ...(isIOS && {
              width: displayWidth,
              height: displayHeight,
              style: {
                transform: "scale(1)",
                transformOrigin: "top left",
              },
            }),
          });

        let dataUrl: string;

        if (isIOS) {
          // Warm-up render for iOS Safari stability
          try {
            await doRender();
            console.log("[v0] iOS warm-up render completed");
          } catch (warmupError) {
            console.log("[v0] iOS warm-up render failed, continuing anyway");
          }
        }

        // Main render
        dataUrl = await doRender();
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

        // More specific error messages for iOS
        if (isIOS) {
          toast({
            title: "Export Failed on iOS",
            description:
              "Try using a smaller image or different format. iOS Safari has limitations with large exports.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Export Failed",
            description: "Please try again",
            variant: "destructive",
          });
        }
      }
    },
    [uploadedImage, format, currentFormat, toast, user]
  );

  const handleCheckoutSuccess = async () => {
    // Refresh credits first
    if (user) {
      const creditData = await getUserCredits(user.uid);
      setUserCredits(creditData.credits);
      setHasSubscription(creditData.subscriptionActive);
    }

    if (checkoutProduct === "image-3pack") {
      exportToJPG(true); // Skip credit check since they just purchased
      toast({
        title: "Download Started",
        description:
          "Your Porsche ad is downloading now. You have credits for 2 more exports.",
      });
    } else if (checkoutProduct === "monthly-subscription") {
      toast({
        title: "Subscription Active",
        description:
          "You now have unlimited exports. Your image is downloading.",
      });
      exportToJPG(true); // Skip credit check since they just subscribed
    }
  };

  const displayTagline = useCustomTagline ? customTagline : selectedTagline;

  const handleExportClick = (productId: string, e: React.MouseEvent) => {
    if (e.shiftKey) {
      console.log("[v0] Dev mode: Bypassing payment for testing");
      if (productId === "image-3pack" || productId === "monthly-subscription") {
        exportToJPG(true); // Skip credit check in dev mode
        toast({
          title: "Dev Mode: Download Started",
          description: "Testing export without payment",
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
              className="overflow-hidden p-0 bg-transparent border-0 shadow-2xl max-h-[80vh] min-h-[100px] mx-auto"
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
                      className="absolute pointer-events-auto cursor-move select-none touch-none"
                      style={{
                        transform: `translate(${textPosition.x}px, ${textPosition.y}px)`,
                        transformOrigin: "bottom left",
                        bottom: 0,
                        left: 0,
                        paddingLeft: "112px",
                        paddingBottom: "176px",
                        paddingTop: "32px",
                        paddingRight: "32px",
                      }}
                      onMouseDown={handleTextMouseDown}
                      onTouchStart={handleTextTouchStart}
                    >
                      <p
                        className="font-porsche font-bold leading-tight text-foreground text-balance"
                        style={{
                          fontSize: `${fontSize}rem`,
                          maxWidth: "512px",
                        }}
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

              {user && (hasSubscription || userCredits > 0) && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    {hasSubscription ? (
                      <>🎉 Unlimited Exports Active</>
                    ) : (
                      <>Credits remaining: {userCredits}</>
                    )}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={(e) => handleExportClick("image-3pack", e)}
                  disabled={!uploadedImage}
                  className="w-full"
                  size="lg"
                >
                  <Download className="mr-2 h-4 w-4" />
                  This Image + 2 More for Free - $
                  {(PRODUCTS[0].priceInCents / 100).toFixed(2)}
                </Button>
                <Button
                  onClick={(e) => handleExportClick("monthly-subscription", e)}
                  disabled={!uploadedImage}
                  variant="secondary"
                  className="w-full"
                  size="lg"
                >
                  <Car className="mr-2 h-4 w-4" />
                  Unlimited Exports - $
                  {(PRODUCTS[1].priceInCents / 100).toFixed(2)}{" "}
                  <span className="text-gray-500 text-[10px]">/mo</span>
                </Button>
                {/* <button
                  onClick={(e) => {
                    if (uploadedImage) {
                      handleExportClick("image-3pack", {
                        shiftKey: true,
                      } as React.MouseEvent);
                    }
                  }}
                  disabled={!uploadedImage}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center mt-2 underline disabled:no-underline disabled:hover:text-muted-foreground"
                >
                  Dev tip: Tap here to test export (bypass payment)
                </button> */}
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
