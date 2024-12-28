import {
    LOGIN_FAIL,
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOAD_USER_REQUEST,
    LOAD_USER_SUCCESS,
    LOAD_USER_FAIL,
    LOGOUT_SUCCESS,
    LOGOUT_FAIL,
    CLEAR_ERRORS,
} from "../constants/userConstants";

import { createReducer } from "@reduxjs/toolkit";

interface UserState {
    user: Record<string, any>;
    loading?: boolean;
    isAuthenticated?: boolean;
    error?: string;
}

interface Action {
    type: string;
    payload?: any;
}

const initialState: UserState = { user: {} };

export const userReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(LOGIN_REQUEST, (state) => {
            state.loading = true;
            state.isAuthenticated = false;
        })
        .addCase(LOGIN_SUCCESS, (state, action: Action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
        })
        .addCase(LOGIN_FAIL, (state, action: Action) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.error = action.payload;
        })
        .addCase(LOAD_USER_REQUEST, (state) => {
            state.loading = true;
        })
        .addCase(LOAD_USER_SUCCESS, (state, action: Action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
        })
        .addCase(LOAD_USER_FAIL, (state, action: Action) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.error = action.payload;
        })
        .addCase(LOGOUT_SUCCESS, (state) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = {};
        })
        .addCase(LOGOUT_FAIL, (state, action: Action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase(CLEAR_ERRORS, (state) => {
            state.error = undefined;
        });
});
