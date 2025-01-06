import './App.css'
import HomeLoader from '@components/Loaders/HomeLoader'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignupFormDemo } from '@pages/Register';
import { LoginFormDemo } from '@pages/Login';
import MainLayout from '@components/layouts/MainLayout';
import Home from '@pages/Home';
import { Search } from '@pages/SearchPage';
import { Golocal } from '@pages/GoLocal';
import { Toaster } from "@components/ui/toaster"
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loaduser } from 'actions/userActions';
import { AppDispatch } from 'store';
import ChannelPage from '@pages/Channel';



function App() {

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(loaduser());
  }, [dispatch]);

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
