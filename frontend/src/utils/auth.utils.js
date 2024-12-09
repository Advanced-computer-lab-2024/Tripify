// src/utils/auth.utils.js

export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("userRole");
  window.location.href = "/auth";
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const getCurrentRole = () => {
  return localStorage.getItem("userRole");
};

export const setAuthData = (token, user, role) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("userRole", role);
};
