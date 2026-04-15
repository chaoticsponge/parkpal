"use client";

import { DATA_API } from "@/util/APIs";
import React, { ReactNode, FC, createContext, useContext, useState } from "react";

export type UserInfo = {
  walletAddress: string;
  plates: string[];
  isHandicapped: boolean;
}

export type UserProfile = {
  user?: UserInfo;
  disconnect: () => void;
  initialiseUser: (address: string) => Promise<void>;
  refetch: () => Promise<void>;
  loading: boolean;
}

export const UserProfileContext = createContext<UserProfile | undefined>(undefined);

export const UserContextProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {

  const [loading, setLoading] = useState<boolean>(true);

  const [user, setUser] = useState<UserInfo | undefined>(() => {
    if (typeof window !== 'undefined') {
      // Check if user exists in localStorage on component mount
      const storedUser = localStorage.getItem('user');
      setLoading(false);
      return storedUser ? JSON.parse(storedUser) : undefined;
    }
    return undefined
  });

  const initialiseUser = async (address: string) => {
    setLoading(true);
    // if(user) {
    //   // if address is the same as the current user, return
    //   if(user.walletAddress === address) {
    //     setLoading(false);
    //     return;
    //   }

    //   // if address is different, disconnect the current user
    //   setUser(undefined);
    //   localStorage.removeItem('user');
    // }

    // User Call from Database
    await fetch(`${DATA_API}/api/user/` + address, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    .then((res) => res.json())
    .then(async (res) => {
      const user = res.data?.user;

      if(!user) {
        setLoading(false);
        return;
      }

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    })

  }

  const disconnect = async () => {
    console.log("Disconnecting User From Cache");
    setUser(undefined);
    localStorage.removeItem('user');
  }

  const refetch = async () => {
    if(!user) return;
    await initialiseUser(user.walletAddress);
  }

  const context: UserProfile = {
    user,
    disconnect,
    initialiseUser,
    refetch,
    loading,
  }

  return (
    <UserProfileContext.Provider value={context}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return context;
}