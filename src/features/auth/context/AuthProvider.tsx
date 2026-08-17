import  type {ReactNode } from "react";
import { useState } from "react";
import type {loggedUser } from "../types";
import { AuthContext } from "./AuthContext";
import { getUserPermissions } from "../authService";

interface Props {
  children: ReactNode;
}

export default function AuthProvider({ children }: Props) {


  const [user, setUser] = useState<any | null>(() => {
    const savedUser = localStorage.getItem("user");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [permissions, setPermissions] = useState<any[]>([]);

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("access");
  });

  const login = (user: loggedUser, token: string) => {
   
    setUser(user);

    setToken(token);
    console.log(user);

  };

  const logout = () => {

  
    localStorage.removeItem("user");

    localStorage.removeItem("access");
    window.location.replace("/desk");
      setUser(null);
      setToken(null);
    
  // localStorage.removeItem("permissions");
    

  };

  const refreshPermissions = async () => {
    if (!user?.id) return;

    const response = await getUserPermissions(user.id);

    const newPermissions = response.data;

    setPermissions(newPermissions);

    localStorage.setItem(
        "permissions",
        JSON.stringify(newPermissions)
    );
};

 const hasPermission = (route: string, action_code:string) => {
    if (!user) return false;

    const permissions = JSON.parse(
        localStorage.getItem("permissions") || "[]"
    );

    return permissions.some(
        (p: any) =>
            p.route === route &&
            p.action_code === action_code
    );
};

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        hasPermission,
        refreshPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}