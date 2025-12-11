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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Account created! You can now export your ad.");
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
      await signInWithPopup(auth, googleProvider);
      toast.success("Signed in with Google! You can now export your ad.");
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
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

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
              <Button type="submit" className="w-full h-11" disabled={loading}>
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Please wait..."
              : isSignUp
              ? "Create Account"
              : "Sign In"}
          </Button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </Button>
          <button
            type="button"
            onClick={handlePasswordReset}
            className="text-sm text-muted-foreground hover:text-foreground w-full text-center underline mt-4"
          >
            Forgot password?
          </button>
        </form>
        <div className="mt-6 text-center">
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
