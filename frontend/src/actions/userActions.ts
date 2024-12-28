import axios from "axios";
import { Dispatch } from "redux";
import {
    LOAD_USER_FAIL,
    LOAD_USER_REQUEST,
    LOAD_USER_SUCCESS,
    LOGIN_FAIL,
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
} from "constants/userConstants";
import { toaster } from "@components/ui/toaster";

interface LoginAction {
    type: string;
    payload?: any;
}

export const login = (username: string, password: string) =>
    async (dispatch: Dispatch<LoginAction>): Promise<void> => {
        try {
            dispatch({ type: LOGIN_REQUEST });

            const config = {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            };

            const { data } = await axios.post(
                `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/user/login`,
                { username, password },
                config
            );

            dispatch({ type: LOGIN_SUCCESS, payload: data.user });
            sessionStorage.setItem('loginRedirect', 'true');


            if (data) {
                if (data.status === "verification") {
                    toaster.create({
                        description: data.message,
                        type: "warning",
                    })
                }
                toaster.create({
                    title: `Welcome to hyperlocal ${data.user.firstName}`,
                    description: "You have successfully logged in",
                    type: "success",
                })
            }
        } catch (error: any) {
            dispatch({
                type: LOGIN_FAIL,
                payload: error.response?.data?.message || "Something went wrong",
            });
            toaster.create({
                description: error.response.data.message,
                type: "error",
            })
        }
    };

export const loaduser = () => async (dispatch: Dispatch<LoginAction>) => {
    try {
        dispatch({ type: LOAD_USER_REQUEST });

        const { data } = await axios.get(`${import.meta.env.VITE_API_BACKEND_URL}/api/v1/user/load-user`, { withCredentials: true });

        dispatch({ type: LOAD_USER_SUCCESS, payload: data.user });

        if (data.status === 'success') {
            toaster.create({
                title: `Welcome to hyperlocal ${data.user.firstName}`,
                description: "You have successfully logged in",
                type: "success",
            })
        }
    } catch (error: any) {
        dispatch({ type: LOAD_USER_FAIL, payload: error.response.data.message });
        // toaster.create({
        //     description: error.response.data.message,
        //     type: "error",
        // })
    }
}