import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignupFormDemo } from "@pages/Register";
import { LoginFormDemo } from "@pages/Login";
import MainLayout from "@components/layouts/MainLayout";
import Home from "@pages/Home";
import { Search } from "@pages/SearchPage";
import { Golocal } from "@pages/GoLocal";
import { Toaster } from "@components/ui/toaster";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loaduser } from "actions/userActions";
import { AppDispatch, RootState } from "store";
import ChannelPage from "@pages/Channel";
import { checkLocationPermission, fetchCoords } from "@lib/utils";

import { SocketProvider } from "./socket";
import ChatPage from "@pages/Chat";
import UserProfile from "@pages/UserProfile";
import { SinglePost } from "@pages/SinglePost";
import { JamPage } from "@pages/Jam";

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(loaduser());
  }, [dispatch]);

  const [stopTracking, setStopTracking] = useState<(() => void) | undefined>();

  // Start tracking when the app mounts

  useEffect(() => {
    checkLocationPermission();
  }, []);

  useEffect(() => {
    const initLocationTracking = async () => {
      const stopFn = await fetchCoords(isAuthenticated || false);
      setStopTracking(() => stopFn); // Save the cleanup function
    };

    if (sessionStorage.getItem("locationEnabled")) {
      initLocationTracking();
    }

    // Cleanup when the component unmounts
    return () => {
      if (stopTracking) {
        stopTracking();
      }
    };
  }, []);

  return (
    <SocketProvider>
      <BrowserRouter>
        <Toaster />

        <Routes>
          <Route
            path="/"
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />
          <Route path="/register" element={<SignupFormDemo />} />
          <Route path="/login" element={<LoginFormDemo />} />
          <Route
            path="/search"
            element={
              <MainLayout>
                <Search />
              </MainLayout>
            }
          />
          <Route
            path="/go-local"
            element={
              <MainLayout>
                <Golocal />
              </MainLayout>
            }
          />
          <Route
            path="/channel/:id"
            element={
              <MainLayout>
                <ChannelPage />
              </MainLayout>
            }
          />
          <Route
            path="/user/:id"
            element={
              <MainLayout>
                <UserProfile />
              </MainLayout>
            }
          />
          <Route
            path="/post/detail/:postId"
            element={
              <MainLayout>
                <SinglePost />
              </MainLayout>
            }
          />
          <Route path="/chat" element={!isAuthenticated ? <LoginFormDemo /> : <ChatPage />} />
          <Route
            path="/join/jam/:jamId"
            element={!isAuthenticated ? <LoginFormDemo /> : <JamPage />}
          />
          {/* <Route path="/channel/:id" element={<ChannelPage />} /> */}
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
};

export default App;
