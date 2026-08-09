import { createContext } from "react";
import type { loggedUser } from "../types";

// What this file does

// This file does not store anything.

export interface AuthContextType {
    user: loggedUser | null;
    token: string | null;
    login: (user: loggedUser, token: string) => void;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

// This creates the empty box.

// Right now it contains nothing.