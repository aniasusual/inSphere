import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of your context state
interface GlobalState {
    user: string | null;
    //   isLoggedIn: boolean;
    //   setUser: (user: string | null) => void;
    //   setIsLoggedIn: (isLoggedIn: boolean) => void;
}

// Define default values for context
const defaultState: GlobalState = {
    user: null,
    //   isLoggedIn: false,
    //   setUser: () => {},
    //   setIsLoggedIn: () => {},
};

// Create the context
const GlobalContext = createContext<GlobalState>(defaultState);

// Custom hook to use the context
export const useGlobalContext = () => useContext(GlobalContext);

// Provider component
interface GlobalProviderProps {
    children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
    const [user, setUser] = useState<string | null>(null);
    // const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    return (
        // <GlobalContext.Provider value={{ user, isLoggedIn, setUser, setIsLoggedIn }}>
        <GlobalContext.Provider value={{ user }}>
            {children}
        </GlobalContext.Provider>
    );
};
