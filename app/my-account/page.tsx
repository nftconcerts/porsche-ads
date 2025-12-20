"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { adminDb } from "@/lib/firebase-admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import { getCheckoutSession } from "@/app/actions/stripe";
import { getUserCredits } from "@/lib/user-credits";

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
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [images, setImages] = useState<AdImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const success = searchParams.get("success");
    const sessionId = searchParams.get("session_id");

    if (success === "true" && sessionId && user) {
      // Verify the session and show success message
      verifySubscription(sessionId);
    }
  }, [searchParams, user]);

  const verifySubscription = async (sessionId: string) => {
    try {
      const result = await getCheckoutSession(sessionId);
      if (result.success && result.session?.payment_status === "paid") {
        setShowSuccess(true);
        // Refresh user credits/subscription status
        if (user) {
          const creditData = await getUserCredits(user.uid);
          setSubscriptionActive(creditData.subscriptionActive);
        }
        toast({
          title: "Subscription Active! 🎉",
          description: "You now have unlimited downloads.",
        });
        // Remove query params from URL
        router.replace("/my-account");
      }
    } catch (error) {
      console.error("Error verifying subscription:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserImages();
      fetchSubscriptionStatus();
    }
  }, [user]);

  const fetchSubscriptionStatus = async () => {
    if (!user) return;
    try {
      const creditData = await getUserCredits(user.uid);
      setSubscriptionActive(creditData.subscriptionActive);
    } catch (error) {
      console.error("Error fetching subscription status:", error);
    }
  };

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

        {showSuccess && (
          <Card className="p-6 mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Subscription Activated!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  You now have unlimited downloads. Create as many Porsche ads
                  as you want!
                </p>
              </div>
            </div>
          </Card>
        )}

        {subscriptionActive && (
          <Card className="p-4 mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  Unlimited Subscription Active
                </span>
              </div>
              <Link href="/">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Create New Ad
                </Button>
              </Link>
            </div>
          </Card>
        )}

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
