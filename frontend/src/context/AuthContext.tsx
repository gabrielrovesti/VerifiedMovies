import React, { useState, createContext, useEffect, useContext } from 'react';

type User = {
  did: string;
};

type AuthContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const logout = () => {
    sessionStorage.setItem("loggedIn", "false");
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    setIsAuthenticated(Boolean(user));
  }, [user]);

  useEffect(() => {
    const loggedIn = sessionStorage.getItem("loggedIn");
    if(loggedIn === "true") {
      setIsAuthenticated(true);
    }
  }, []);
  
  const authContextValue: AuthContextType = { user, setUser, isAuthenticated, logout };

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

interface AuthProviderProps {
  children: React.ReactNode;
}


export const useAuth = (): AuthContextType => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return authContext;
};

