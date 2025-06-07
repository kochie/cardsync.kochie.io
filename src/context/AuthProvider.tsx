"use client";

import * as React from "react";
import { Tokens } from "next-firebase-auth-edge";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { app } from "@/firebase";
import { getValidCustomToken } from "next-firebase-auth-edge/next/client";

import { createContext, useContext } from "react";
import { UserInfo } from "firebase/auth";
import {
  Claims,
  filterStandardClaims,
} from "next-firebase-auth-edge/lib/auth/claims";

export interface User extends UserInfo {
  emailVerified: boolean;
  customClaims: Claims;
}

export interface AuthContextValue {
  user: User | null;
  tokens: Tokens | null;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  tokens: null,
});
export interface AuthProviderProps {
  tokens: Tokens | null;
  children: React.ReactNode;
}

export const AuthProvider: React.FunctionComponent<AuthProviderProps> = ({
  tokens,
  children,
}) => {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    // console.log("tokens", tokens);

    const signIn = async () => {
      if (!tokens) return;
      const auth = getAuth(app);

      if (!tokens?.customToken) {
        console.error("No custom token provided");
        return;
      }

      const customToken = await getValidCustomToken({
        serverCustomToken: tokens.customToken,
        refreshTokenUrl: "/api/refresh-token",
      });

      if (!customToken) {
        console.error("Invalid custom token");
        return;
      }

      try {
        await signInWithCustomToken(auth, customToken);

        if (!tokens) {
          setUser(null);
        } else {
          setUser(toUser(tokens));
        }
      } catch (err) {
        console.error("Firebase sign-in error:", err);
      }
    };

    signIn();
  }, [tokens]);

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return {
    user: context.user,
    tokens: context.tokens,
  };
};

const toUser = ({ decodedToken }: Tokens): User => {
  const {
    uid,
    email,
    picture: photoURL,
    email_verified: emailVerified,
    phone_number: phoneNumber,
    name: displayName,
    source_sign_in_provider: signInProvider,
  } = decodedToken;

  const customClaims = filterStandardClaims(decodedToken);

  return {
    uid,
    email: email ?? null,
    displayName: displayName ?? null,
    photoURL: photoURL ?? null,
    phoneNumber: phoneNumber ?? null,
    emailVerified: emailVerified ?? false,
    providerId: signInProvider,
    customClaims,
  };
};
