"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

interface UserRole {
  role?: string;
  stripeCustomerId?: string;
  purchasedAt?: number;
  subscriptionActive?: boolean;
  hasCredits?: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);

      if (authUser) {
        try {
          // Get user's custom claims
          const idTokenResult = await authUser.getIdTokenResult();
          setUserRole({
            role: idTokenResult.claims.role as string,
            stripeCustomerId: idTokenResult.claims.stripeCustomerId as string,
            purchasedAt: idTokenResult.claims.purchasedAt as number,
            subscriptionActive: idTokenResult.claims
              .subscriptionActive as boolean,
            hasCredits: idTokenResult.claims.hasCredits as boolean,
          });
        } catch (error) {
          console.error("Error getting user claims:", error);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, userRole, loading };
}

export function useRequireAuth(redirectUrl = "/") {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = redirectUrl;
    }
  }, [user, loading, redirectUrl]);

  return { user, loading };
}

export function useCustomerRole() {
  const { userRole, loading } = useAuth();

  const isPackCustomer = userRole?.role === "pack_customer";
  const isSubscriptionCustomer = userRole?.role === "subscription_customer";
  const isAnyCustomer = isPackCustomer || isSubscriptionCustomer;
  const hasActiveSubscription = userRole?.subscriptionActive || false;

  return {
    isPackCustomer,
    isSubscriptionCustomer,
    isAnyCustomer,
    hasActiveSubscription,
    role: userRole?.role,
    loading,
  };
}
