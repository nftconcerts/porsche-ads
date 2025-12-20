"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { initializeNewUser } from "@/app/actions/init-user";

const googleProvider = new GoogleAuthProvider();

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  mode?: "signup" | "signin";
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  mode = "signin",
}: AuthModalProps = {}) {
  const router = useRouter();
  const { user, userRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(mode === "signup");
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        // Initialize new user with 1 free credit
        await initializeNewUser(
          userCredential.user.uid,
          userCredential.user.email!
        );
        toast.success("Account created! You got 1 free download.");
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Logged in successfully!");
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email already in use. Try signing in instead.");
      } else if (error.code === "auth/wrong-password") {
        toast.error("Incorrect password");
      } else if (error.code === "auth/user-not-found") {
        toast.error("No account found with this email");
      } else if (error.code === "auth/weak-password") {
        toast.error("Password should be at least 6 characters");
      } else {
        toast.error("Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error("Failed to send reset email. Please try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Initialize new user with 1 free credit (will only set if new user)
      await initializeNewUser(result.user.uid, result.user.email!);
      toast.success("Signed in with Google!");
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        toast.error("Sign-in cancelled");
      } else {
        toast.error("Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  // If used as a page (not modal)
  if (!isOpen && user) {
    return (
      <div className="min-h-screen p-6 bg-[#0E0E12] flex items-center justify-center">
        <Card className="p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <Label>Email</Label>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div>
              <Label>Role</Label>
              <p className="text-sm text-muted-foreground">
                {userRole?.role || "No purchases yet"}
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="w-full">
              Sign Out
            </Button>
            <Button onClick={() => router.push("/")} className="w-full">
              Back to Ad Builder
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Modal mode
  if (isOpen !== undefined && onClose) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="text-2xl font-bold text-center">
            {isSignUp ? "Create Free Account" : "Sign In"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isSignUp
              ? "Get your first export free! Google sign-in is fastest."
              : "Welcome back! Sign in to continue."}
          </DialogDescription>

          <div className="space-y-4 mt-4">
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-white text-black hover:bg-gray-100 font-semibold h-12"
              disabled={loading}
            >
              <Image
                src="/favicon/google-logo.png"
                alt="Google"
                width={20}
                height={20}
                className="mr-2"
              />
              Continue with Google
            </Button>

            {!showEmailForm ? (
              <Button
                type="button"
                onClick={() => setShowEmailForm(true)}
                variant="outline"
                className="w-full h-12"
              >
                Use Email Instead
              </Button>
            ) : (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or use email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-3">
                  <div>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="h-11"
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password (min 6 characters)"
                      required
                      minLength={6}
                      className="h-11"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full !text-black"
                    disabled={loading}
                  >
                    {loading
                      ? "Please wait..."
                      : isSignUp
                      ? "Create Account"
                      : "Sign In"}
                  </Button>
                </form>

                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-center w-full text-muted-foreground hover:text-foreground"
                >
                  {isSignUp
                    ? "Already have an account? Sign in"
                    : "Need an account? Sign up"}
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Page mode (fallback)
  return (
    <div className="min-h-screen p-6 bg-[#0E0E12] flex items-center justify-center">
      <Card className="p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isSignUp ? "Create Your Account" : "Sign In to Your Account"}
        </h2>
        <div className="space-y-4">
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full bg-white text-black hover:bg-gray-100 font-semibold h-12"
            disabled={loading}
          >
            <Image
              src="/favicon/google-logo.png"
              alt="Google"
              width={20}
              height={20}
              className="mr-2"
            />
            Continue with Google
          </Button>

          {!showEmailForm ? (
            <Button
              type="button"
              onClick={() => setShowEmailForm(true)}
              variant="outline"
              className="w-full h-12"
            >
              Use Email Instead
            </Button>
          ) : (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or use email
                  </span>
                </div>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" className="w-full !text-black" disabled={loading}>
                  {loading
                    ? "Please wait..."
                    : isSignUp
                    ? "Create Account"
                    : "Sign In"}
                </Button>
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-sm text-muted-foreground hover:text-foreground w-full text-center underline"
                >
                  Forgot password?
                </button>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-muted-foreground hover:text-foreground underline"
                >
                  {isSignUp
                    ? "Already have an account? Sign in"
                    : "Need an account? Sign up"}
                </button>
              </div>
            </>
          )}
        </div>
        <div className="mt-4 pt-4 border-t text-center">
          <Button
            onClick={() => router.push("/")}
            variant="link"
            className="text-sm"
          >
            Back to Ad Builder
          </Button>
        </div>
      </Card>
    </div>
  );
}
