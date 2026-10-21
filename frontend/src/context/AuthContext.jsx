import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getMeAPI,
  loginAPI,
  registerAPI,
  googleAuthAPI,
  logoutAPI,
  updateProfileAPI,
  changePasswordAPI,
  forgotPasswordAPI,
  resetPasswordAPI,
} from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check current session on initial load
  const loadUser = useCallback(async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await getMeAPI();
      if (res.success && res.user) {
        setUser(res.user);
        if (res.user.businessName) {
          localStorage.setItem('bizpulse_bname', res.user.businessName);
        }
        if (res.user.currency) {
          localStorage.setItem('bizpulse_currency', res.user.currency);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
      // Clean up fallback token if session is invalid
      if (err.response?.status === 401) {
        localStorage.removeItem('vyapar_jwt');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();

    // Listen for suspension events
    const handleSuspended = () => {
      setUser((prev) => (prev ? { ...prev, accountStatus: 'suspended' } : null));
    };

    window.addEventListener('vyapar:account-suspended', handleSuspended);
    return () => window.removeEventListener('vyapar:account-suspended', handleSuspended);
  }, [loadUser]);

  // Login with Email & Password
  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await loginAPI({ email, password });
      if (res.success && res.user) {
        if (res.token) localStorage.setItem('vyapar_jwt', res.token);
        setUser(res.user);
        if (res.user.businessName) localStorage.setItem('bizpulse_bname', res.user.businessName);
        if (res.user.currency) localStorage.setItem('bizpulse_currency', res.user.currency);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setAuthError(msg);
      return {
        success: false,
        message: msg,
        accountStatus: err.response?.data?.accountStatus,
      };
    } finally {
      setLoading(false);
    }
  };

  // Register new User
  const register = async (userData) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await registerAPI(userData);
      if (res.success && res.user) {
        if (res.token) localStorage.setItem('vyapar_jwt', res.token);
        setUser(res.user);
        if (res.user.businessName) localStorage.setItem('bizpulse_bname', res.user.businessName);
        if (res.user.currency) localStorage.setItem('bizpulse_currency', res.user.currency);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setAuthError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In / Sign-Up
  const googleLogin = async (credential, businessName) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await googleAuthAPI({ credential, businessName });
      if (res.success && res.user) {
        if (res.token) localStorage.setItem('vyapar_jwt', res.token);
        setUser(res.user);
        if (res.user.businessName) localStorage.setItem('bizpulse_bname', res.user.businessName);
        if (res.user.currency) localStorage.setItem('bizpulse_currency', res.user.currency);
        return {
          success: true,
          user: res.user,
          needsOnboarding: res.needsOnboarding,
        };
      }
      return { success: false, message: res.message || 'Google authentication failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Google authentication failed';
      setAuthError(msg);
      return {
        success: false,
        message: msg,
        accountStatus: err.response?.data?.accountStatus,
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await logoutAPI();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('vyapar_jwt');
      setUser(null);
    }
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    try {
      const res = await updateProfileAPI(profileData);
      if (res.success && res.user) {
        setUser(res.user);
        if (res.user.businessName) localStorage.setItem('bizpulse_bname', res.user.businessName);
        if (res.user.currency) localStorage.setItem('bizpulse_currency', res.user.currency);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update profile' };
    }
  };

  // Change Password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await changePasswordAPI({ currentPassword, newPassword });
      return res;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to change password',
      };
    }
  };

  // Forgot Password
  const forgotPassword = async (email) => {
    try {
      const res = await forgotPasswordAPI(email);
      return res;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to request password reset',
      };
    }
  };

  // Reset Password
  const resetPassword = async (token, password) => {
    try {
      const res = await resetPasswordAPI({ token, password });
      return res;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to reset password',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isSuspended: user?.accountStatus === 'suspended',
        login,
        register,
        googleLogin,
        logout,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        refreshSession: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
