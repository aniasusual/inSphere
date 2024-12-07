import './App.css'
import HomeLoader from '@components/Loaders/HomeLoader'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignupFormDemo } from '@pages/Register';
import { LoginFormDemo } from '@pages/Login';
import MainLayout from '@components/layouts/MainLayout';
import Home from '@pages/Home';


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/register" element={<SignupFormDemo />} />
        <Route path="/login" element={<LoginFormDemo />} />
      </Routes>
    </BrowserRouter>

  )
}

export default App
