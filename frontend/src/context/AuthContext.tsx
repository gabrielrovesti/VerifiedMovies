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
    localStorage.setItem("userIsLoggedIn", "false");
    localStorage.setItem("loggedDID", "");
    setUser(null);
    setIsAuthenticated(false);
  };  

  useEffect(() => {
    setIsAuthenticated(Boolean(user));
  }, [user]);

  useEffect(() => {
    const userIsLoggedIn = localStorage.getItem("userIsLoggedIn");
    if (userIsLoggedIn === "true") {
      setUser({
        did: localStorage.getItem("loggedDID") || "",
      });
    }
  }, [isAuthenticated]);  

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem("userIsLoggedIn", "true");
      localStorage.setItem("loggedDID", user?.did || "");
    }
  }, [isAuthenticated, user]);

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
