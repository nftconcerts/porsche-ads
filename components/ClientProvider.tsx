"use client";

import React, { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);

        // Update last login timestamp
        try {
          const userDocRef = doc(db, "users", authUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            await setDoc(
              userDocRef,
              {
                lastLogin: serverTimestamp(),
              },
              { merge: true }
            );
          }

          // Get custom claims to check user role
          const idTokenResult = await authUser.getIdTokenResult();
          const role = idTokenResult.claims.role;
          console.log("User role:", role);
        } catch (error) {
          console.error("Error updating user data:", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      {children}
    </>
  );
}
