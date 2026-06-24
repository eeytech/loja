"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useState,
} from "react";

import type { SessionUser } from "@/lib/session";

type SessionContextType = {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
};

const SessionContext = createContext<SessionContextType>({
  user: null,
  setUser: () => {},
});

type SessionProviderProps = {
  initialUser: SessionUser | null;
  children: ReactNode;
};

export function SessionProvider({ initialUser, children }: SessionProviderProps) {
  const [user, setUser] = useState<SessionUser | null>(initialUser);

  return (
    <SessionContext.Provider value={{ user, setUser }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
