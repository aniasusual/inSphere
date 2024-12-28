"use client";
import React, { useEffect, useState } from "react";
import { Label } from "@components/ui/aceternity/label";
import { Input } from "@components/ui/aceternity/input";
import { cn } from "../lib/utils";
import {
    IconBrandGoogle,
    IconEye,
    IconEyeOff,
} from "@tabler/icons-react";

import logo from "../assets/hyperlocalsvg.svg"
import { ShootingStars } from "../components/ui/aceternity/shooting-stars";
import { StarsBackground } from "../components/ui/aceternity/stars-background";
import { usernameValidator } from "@lib/validators";
import axios from "axios"
import { toaster } from "@components/ui/toaster";
import { Typography } from "@material-tailwind/react";

import { Spinner } from "@material-tailwind/react";
import { Link } from "react-router-dom";



export function SignupFormDemo() {
    const [showPassword, setShowPassword] = useState(false)
    const [validationError, setValidationError] = useState("");
    const [loader, setLoader] = useState(false);



    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoader(true);

        try {
            const myForm = new FormData();

            myForm.set("firstName", firstName);
            myForm.set("lastName", lastName);
            myForm.set("email", email);
            myForm.set("username", username);
            myForm.set("password", password);

            const config = {
                headers: { "Content-Type": "application/json" },
                withCredentials: true
            };

            const { data } = await axios.post(`${import.meta.env.VITE_API_BACKEND_URL}/api/v1/user/register`, myForm, config);


            if (data) {
                toaster.create({
                    description: "User registered successfully",
                    type: "success",
                })
                setLoader(false);
            }

        } catch (error: any) {
            console.log("then it reaches here", error);
            setLoader(false)
            toaster.create({
                description: error.response.data.message,
                type: "error",
            })
        }

    };

    const registerDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });

        if (name === "username") {
            const validationResult = usernameValidator(value);
            if (!validationResult.isValid) {
                setValidationError(validationResult.errorMessage);
            } else {
                setValidationError("");
            }
        }
        // setUser({ ...user, [e.target.name]: e.target.value });
    };


    const [user, setUser] = useState({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
    });

    const { firstName, lastName, email, username, password } = user;




    return (
        <div className="dark bg-black min-h-screen flex items-center justify-center fixed inset-0 ">
            <div className="max-w-md w-full rounded-none md:rounded-2xl p-1 md:p-3 shadow-input bg-black z-10 flex flex-col items-center justify-center">
                <div className="flex justify-center items-center flex-col">
                    <span className="font-bold text-sm text-neutral-800 text-white text-center">Welcome to</span>
                    <img src={logo} alt="" className="w-16 h-auto mb-1 my-2 lg:w-24" />
                </div>

                <form className="my-8 w-full" onSubmit={handleSubmit}>
                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
                        <LabelInputContainer>
                            <Label htmlFor="firstName" className="text-white">First name</Label>
                            <Input id="firstName" placeholder="Tyler" type="text" name="firstName" value={firstName} onChange={registerDataChange} />
                        </LabelInputContainer>
                        <LabelInputContainer>
                            <Label htmlFor="lastName" className="text-white">Last name</Label>
                            <Input id="lastName" placeholder="Durden" type="text" name="lastName" value={lastName} onChange={registerDataChange} />
                        </LabelInputContainer>
                    </div>
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="email" className="text-white">Email Address</Label>
                        <Input id="email" placeholder="projectmayhem@fc.com" type="email" name="email" value={email} onChange={registerDataChange} />
                    </LabelInputContainer>
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="username" className="text-white">Username</Label>
                        <Input id="text" placeholder="username" type="text" name="username" value={username} onChange={registerDataChange} />
                        {validationError && (
                            <Typography variant="small" color="red">
                                {validationError}
                            </Typography>
                        )}
                    </LabelInputContainer>
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="password" className="text-white">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                placeholder="••••••••"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={password}
                                onChange={registerDataChange}
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

                    {loader ? (<div className="flex justify-center items-center">
                        <Spinner color="red" />

                    </div>
                    ) :
                        (
                            <button
                                className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                                type="submit" disabled={loader}
                            >
                                Sign up &rarr;

                                <BottomGradient />
                            </button>)}


                    <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-4 h-[1px] w-full" />
                </form>
                <Link to={`${import.meta.env.VITE_API_BACKEND_URL}/api/v1/user/google`} className="w-[100%]">
                    <div className="flex flex-col space-y-4">
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
        </div >

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
