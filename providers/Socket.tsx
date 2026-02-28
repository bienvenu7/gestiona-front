import { socket } from "@/configs/socket.config";
import React, { ReactNode, createContext, useContext, useEffect } from "react";
import { Socket } from "socket.io-client";

type SocketContextType = Socket | null;

const SocketContext = createContext<SocketContextType>(null);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
