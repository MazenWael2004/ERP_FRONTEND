import { jwtDecode } from "jwt-decode";


export function decodeToken() {
  const token = localStorage.getItem("access");

  if (!token) return null;

  return jwtDecode<JwtPayload>(token);
}