"use client";
import React, { useEffect, useState } from "react";
import { Label } from "@components/ui/aceternity/label";
import { Input } from "@components/ui/aceternity/input";
import { cn } from "../lib/utils";
import { IconBrandGoogle, IconEye, IconEyeOff } from "@tabler/icons-react";

import logo from "../assets/hyperlocalsvg.svg";
import { ShootingStars } from "../components/ui/aceternity/shooting-stars";
import { StarsBackground } from "../components/ui/aceternity/stars-background";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { login } from "actions/userActions";
import type { AppDispatch } from "store";
import type { RootState } from "store";
import { Spinner } from "@material-tailwind/react";

export function LoginFormDemo() {
  const [showPassword, setShowPassword] = useState(false);

  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    dispatch(login(username, password));
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated]);

  return (
    <div className="dark bg-black min-h-screen flex items-center justify-center fixed inset-0 ">
      <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-black z-50 flex flex-col items-center justify-center">
        <h2 className="font-bold text-xl text-neutral-800 text-white text-center">
          <span className="font-bold text-sm text-neutral-800 text-white text-center">
            Welcome to
          </span>
          <img
            src={logo}
            alt=""
            className="w-16 h-auto mb-1 my-2 lg:w-24 text-center"
          />
        </h2>
        {/* <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
                Login to aceternity if you can because we don&apos;t have a login flow
                yet
            </p> */}

        <form className="my-2 mb-0 w-full" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="username" className="text-white">
              Username
            </Label>
            <Input
              id="username"
              placeholder="username"
              type="username"
              className="pr-12"
              onChange={(e) => setusername(e.target.value)}
            />
          </LabelInputContainer>
          <LabelInputContainer className="mb-2">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                onChange={(e) => setpassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 p-1 m-1 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <IconEyeOff className="h-5 w-5" />
                ) : (
                  <IconEye className="h-5 w-5" />
                )}
              </button>
            </div>
          </LabelInputContainer>

          {loading ? (
            <div className="flex justify-center items-center">
              <Spinner
                color="red"
                onPointerEnterCapture={() => {}}
                onPointerLeaveCapture={() => {}}
              />
            </div>
          ) : (
            <button
              className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
              type="submit"
            >
              Login &rarr;
              <BottomGradient />
            </button>
          )}

          <span className="cursor-pointer text-xs mt-0.5 text-white">
            Forgot Password?
          </span>

          <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
        </form>
        <Link
          to={`${import.meta.env.VITE_API_BACKEND_URL}/api/v1/user/google`}
          className="w-full"
        >
          <div className="flex flex-col space-y-4 w-full">
            <button
              className=" relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
              type="submit"
            >
              <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
              <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                Google
              </span>
              <BottomGradient />
            </button>
          </div>
        </Link>
      </div>
      <ShootingStars />
      <StarsBackground />
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
