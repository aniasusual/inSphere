import './App.css'
import HomeLoader from '@components/Loaders/HomeLoader'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignupFormDemo } from '@pages/Register';
import { LoginFormDemo } from '@pages/Login';
import MainLayout from '@components/layouts/MainLayout';
import Home from '@pages/Home';
import { Search } from '@pages/SearchPage';
import { Golocal } from '@pages/GoLocal';
import { toaster, Toaster } from "@components/ui/toaster"
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { loaduser } from 'actions/userActions';
import { AppDispatch } from 'store';
import ChannelPage from '@pages/Channel';
import { checkLocationPermission, fetchCoords } from '@lib/utils';



function App() {

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(loaduser());
  }, [dispatch]);

  const [stopTracking, setStopTracking] = useState<(() => void) | undefined>();

  // Start tracking when the app mounts

  useEffect(() => {
    checkLocationPermission();
  }, [])

  useEffect(() => {

    const initLocationTracking = async () => {
      const stopFn = await fetchCoords();
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
  }, [stopTracking]);

  // Handler to manually stop tracking
  const handleStopTracking = () => {
    if (stopTracking) {
      stopTracking();
      setStopTracking(undefined);
      toaster.create({
        title: `Location tracking stopped manually`,
        description: "You will be able to access location based features now ",
        type: "success",
      })
    } else {
      toaster.create({
        title: `Some error occured! Location not updated`,
        description: "You might want to restart",
        type: "warning",
      })
    }
  };

  return (
    <BrowserRouter>
      <Toaster />

      <Routes>
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/register" element={<SignupFormDemo />} />
        <Route path="/login" element={<LoginFormDemo />} />
        <Route path="/search" element={<MainLayout><Search /></MainLayout>} />
        <Route path="/go-local" element={<MainLayout><Golocal /></MainLayout>} />
        <Route path="/channel/:id" element={<MainLayout><ChannelPage /></MainLayout>} />
        {/* <Route path="/channel/:id" element={<ChannelPage />} /> */}
      </Routes>
    </BrowserRouter>

  )
}

export default App
