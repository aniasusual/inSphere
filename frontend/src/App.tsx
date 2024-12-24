import './App.css'
import HomeLoader from '@components/Loaders/HomeLoader'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignupFormDemo } from '@pages/Register';
import { LoginFormDemo } from '@pages/Login';
import MainLayout from '@components/layouts/MainLayout';
import Home from '@pages/Home';
import { Search } from '@pages/SearchPage';
import { Golocal } from '@pages/GoLocal';
import { Toaster, toaster } from "@components/ui/toaster"


function App() {

  return (
    <BrowserRouter>
      <Toaster />

      <Routes>
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/register" element={<SignupFormDemo />} />
        <Route path="/login" element={<LoginFormDemo />} />
        <Route path="/search" element={<MainLayout><Search /></MainLayout>} />
        <Route path="/go-local" element={<MainLayout><Golocal /></MainLayout>} />
      </Routes>
    </BrowserRouter>

  )
}

export default App
