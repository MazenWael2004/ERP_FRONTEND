import  type {ReactNode } from "react";
import { useState } from "react";
import type {loggedUser } from "../types";
import { AuthContext } from "./AuthContext";

interface Props {
  children: ReactNode;
}

export default function AuthProvider({ children }: Props) {


  const [user, setUser] = useState<loggedUser | null>(() => {
    const savedUser = localStorage.getItem("user");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("access");
  });

  const login = (user: loggedUser, token: string) => {

    setUser(user);

    setToken(token);

  };

  const logout = () => {

  
    localStorage.removeItem("user");

    localStorage.removeItem("access");
    window.location.replace("/desk");
      setUser(null);
      setToken(null);

    
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}