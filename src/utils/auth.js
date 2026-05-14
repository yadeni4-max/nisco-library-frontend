// utils/auth.js

export const isAuthenticated = () => {
  return localStorage.getItem("token") !== null;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// ✅ NEW: save login session properly
export const login = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

// ✅ get stored user
export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// ✅ get role (IMPORTANT for permissions)
export const getRole = () => {
  return getUser()?.role;
};