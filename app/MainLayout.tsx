"use client";
import { socket } from "@/configs/socket.config";
import { AuthProvider } from "@/providers/AuthContext";
import RtProvider from "@/providers/RtQueryProvider";
import React, { ReactNode, useEffect } from "react";
import { io } from "socket.io-client";

interface Props {
  children: ReactNode;
}

export const MainLayout = ({ children }: Props) => {
  return (
    <AuthProvider>
      <RtProvider>{children}</RtProvider>
    </AuthProvider>
  );
};
