import { createContext } from "react";
import type { loggedUser } from "../types";

// What this file does

// This file does not store anything.

export interface AuthContextType {
    user: any | null;
    token: string | null;
    login: (user: any, token: string) => void;
    logout: () => void;
    hasPermission: (route: string, action_code: string) => boolean;
    refreshPermissions: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

// This creates the empty box.

// Right now it contains nothing.