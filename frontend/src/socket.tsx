import { createContext, useMemo, useContext, useState } from "react";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import { RootState } from "store";
// import { server } from "./constants/config";
const apiUrl = import.meta.env.VITE_API_BACKEND_URL;

const SocketContext = createContext<any>(undefined);;

const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
    children: React.ReactNode;
}

const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {

    const [isConnected, setIsConnected] = useState(false);
    const { user } = useSelector((state: RootState) => state.user);

    // const socket = useMemo(() => io(apiUrl), []);
    const socket = useMemo(() => {
        const newSocket = io(apiUrl, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            auth: {
                // Wrap the token in a string to ensure it's a string type
                token: user?.authToken ? String(user?.authToken) : undefined
            }
        });

        // Add connection listeners
        newSocket.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error: any) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        return newSocket;
    }, [user?.authToken]);



    return (
        <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
    );
};

export { SocketProvider, useSocket };

