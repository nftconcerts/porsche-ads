"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AuthModal() {
  const router = useRouter();
  const { user, userRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully!");
      router.push("/");
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === "auth/wrong-password") {
        toast.error("Incorrect password");
      } else if (error.code === "auth/user-not-found") {
        toast.error("No account found with this email");
      } else {
        toast.error("Login failed. Please try again.");
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

  if (user) {
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

  return (
    <div className="min-h-screen p-6 bg-[#0E0E12] flex items-center justify-center">
      <Card className="p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Sign In to Your Account
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
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
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <button
            type="button"
            onClick={handlePasswordReset}
            className="text-sm text-muted-foreground hover:text-foreground w-full text-center underline"
          >
            Forgot password?
          </button>
        </form>
        <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>
            New customer? Purchase an ad to create your account automatically.
          </p>
          <Button
            onClick={() => router.push("/")}
            variant="link"
            className="mt-2"
          >
            Back to Ad Builder
          </Button>
        </div>
      </Card>
    </div>
  );
}
