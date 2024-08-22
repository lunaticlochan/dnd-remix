import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define the type for the context value
type UserContextType = {
  username: string | null;
  setUsername: (name: string | null) => void;
};

// Create the context with an initial default value
const UserContext = createContext<UserContextType>({
  username: null,
  setUsername: () => {},
});

// Provider component to wrap your app
export function UserProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Load the initial username from localStorage
    const storedUsername = localStorage.getItem("uname");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  return (
    <UserContext.Provider value={{ username, setUsername }}>
      {children}
    </UserContext.Provider>
  );
}

// Hook to use the UserContext
export function useUser() {
  return useContext(UserContext);
}
