"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { adminDb } from "@/lib/firebase-admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";

interface AdImage {
  id: string;
  url: string;
  format: string;
  tagline: string;
  timestamp: number;
}

export default function MyAccountPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [images, setImages] = useState<AdImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchUserImages();
    }
  }, [user]);

  const fetchUserImages = async () => {
    if (!user) return;

    try {
      console.log("[my-account] Fetching images for user:", user.uid);
      const idToken = await user.getIdToken();
      const response = await fetch("/api/user-ads", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      console.log("[my-account] Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("[my-account] Received data:", data);
        // Sort by timestamp descending (newest first) in case API didn't sort
        const sortedAds = (data.ads || []).sort(
          (a: AdImage, b: AdImage) => b.timestamp - a.timestamp
        );
        setImages(sortedAds);
      } else {
        const errorData = await response.json();
        console.error("[my-account] Error response:", errorData);
        toast({
          title: "Error",
          description: errorData.error || "Failed to load your images",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("[my-account] Error fetching images:", error);
      toast({
        title: "Error",
        description: "Failed to load your images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url: string, format: string, timestamp: number) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `porsche-ad-${format}-${timestamp}.jpg`;
    a.target = "_blank";
    a.click();

    toast({
      title: "Download Started",
      description: "Your image is downloading",
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0E0E12] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0E12]">
      <Header />
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Account</h1>
          <p className="text-gray-400">{user.email}</p>
        </div>

        <Card className="p-6 mb-8 bg-white dark:bg-gray-900">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
            Your Porsche Ads
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">
                You haven't created any ads yet
              </p>
              <Link href="/">
                <Button>Create Your First Ad</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                >
                  <div className="aspect-square relative bg-gray-100 dark:bg-gray-900">
                    <img
                      src={image.url}
                      alt={image.tagline || "Porsche Ad"}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 min-h-[40px]">
                      {image.tagline || "Custom Porsche Ad"}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="uppercase font-semibold">
                        {image.format}
                      </span>
                      <span>
                        {new Date(image.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      onClick={() =>
                        handleDownload(
                          image.url.replace("/public", "/large"),
                          image.format,
                          image.timestamp
                        )
                      }
                      size="sm"
                      className="w-full bg-black hover:bg-gray-800 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="flex justify-center">
          <Button onClick={handleSignOut} variant="outline" size="lg">
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
