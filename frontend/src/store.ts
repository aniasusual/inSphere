import { configureStore } from "@reduxjs/toolkit"
import { userReducer } from "reducers/userReducer";

const store = configureStore({
    reducer: {
        user: userReducer
    }
})

export type AppDispatch = typeof store.dispatch; // Custom dispatch type
export type RootState = ReturnType<typeof store.getState>; // State type

export default store;
