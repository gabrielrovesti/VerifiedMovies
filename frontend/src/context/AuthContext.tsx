import React, { useState, createContext, useEffect, useContext} from 'react';

type User = {
  did: string;
};

type AuthContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  logout: () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const logout = () => {
    localStorage.removeItem("userIsLoggedIn");
    localStorage.removeItem("loggedDid");
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const userIsLoggedIn = localStorage.getItem("userIsLoggedIn");
    if (userIsLoggedIn === "true") {
      setUser({
        did: localStorage.getItem("loggedDid") || "",
      });
    }
  }, [isAuthenticated]);  

  useEffect(() => {
    setIsAuthenticated(Boolean(user));
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem("userIsLoggedIn", "true");
      localStorage.setItem("loggedDid", user?.did || "");
    }
  }, [isAuthenticated, user]);

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
