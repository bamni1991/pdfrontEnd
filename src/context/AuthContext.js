import React, { createContext, useContext, useState, useEffect } from "react";
import { storeSession, getSession, clearSession } from "../utils/storage";
import { registerPushToken } from "../utils/pushNotifications";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [role_name, setRoleName] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userImage, setUserImage] = useState(null);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    const session = await getSession();
    if (session && session.isLoggedIn) {
      setUser(session.userData);
      setUserId(session.userId);
      setRoleName(session.role_name);
      setUserImage(session.userImage);
    }
    // console.log("Role Name:", role_name);
    setIsLoading(false);
  };

  const login = async (userData) => {
    // debugger;
    await storeSession(userData, userData.id);
    setUser(userData);
    setUserId(userData?.id);
    setRoleName(userData?.role_name);
    setUserImage(userData?.userImage);
    setIsLoading(false);

    // Register push token after login
    try {
      console.log("Registering push token for user:", userData.id);
      console.log("User ID:", userData.id);
      await registerPushToken(userData.id);
    } catch (error) {
      console.error("Failed to register push token:", error);
    }
  };

  const logout = async () => {
    try {
      await clearSession();
      setUser(null);
      setUserId(null);
      setRoleName(null);
      setUserImage(null);
      setIsLoading(false);
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
      setUserId(null);
      setRoleName(null);
      setUserImage(null);
      setIsLoading(false);
    }
  };

  const updateUser = async (updatedUserData) => {
    try {
      const newUserData = { ...user, ...updatedUserData };
      await storeSession(newUserData, newUserData.id);
      setUser(newUserData);
      // Update other states if necessary
      if (updatedUserData.role_name) setRoleName(updatedUserData.role_name);
      if (updatedUserData.profile_image) setUserImage(updatedUserData.profile_image);
    } catch (error) {
      console.error("Update user error:", error);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        userId,
        role_name,
        isLoading,
        isAuthenticated,
        login,
        logout,
        userImage,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
