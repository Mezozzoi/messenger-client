import {createSelector, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {IUserModel} from "../../models/user";
import authApi, {AuthType} from "../../services/auth.api";
import {RootState} from "../store";
import usersApi from "../../services/users.api";
import jwtDecode from "jwt-decode";

export const getUser = (state: RootState) => state.authSlice.user;
export const getDecryptedToken = createSelector(
    (state: RootState) => state.authSlice.access_token,
    (access_token) => {
        if (access_token) return  jwtDecode<AccessToken>(access_token);
        return null;
    }
)

export type AccessToken = {
    id: number,
    email: string,
    exp: number,
    iat: number
}

type InitStateType = {
    user: IUserModel | null
    access_token: string | null,
    refresh_token: string | null
}

const initialState: InitStateType = {
    user: null,
    access_token: null,
    refresh_token: null
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuth: (state, action: PayloadAction<AuthType>) => {
            state.user = action.payload.user;
            state.access_token = action.payload.access_token;
            state.refresh_token = action.payload.refresh_token;
        },
        clearAuth: (state, action: PayloadAction) => {
            state.user = null;
            state.access_token = null;
            state.refresh_token = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
                state.user = null;
                state.access_token = null;
                state.refresh_token = null;
                localStorage.removeItem("token");
            })
            .addMatcher(authApi.endpoints.refresh.matchFulfilled, (state, {payload}) => {
                state.user = payload.user;
                state.access_token = payload.access_token;
                state.refresh_token = payload.refresh_token;
                localStorage.setItem("token", payload.access_token);
            })
            .addMatcher(authApi.endpoints.login.matchFulfilled, (state, {payload}) => {
                state.user = payload.user;
                state.access_token = payload.access_token;
                state.refresh_token = payload.refresh_token;
                localStorage.setItem("token", payload.access_token);
            })
            .addMatcher(authApi.endpoints.register.matchFulfilled, (state, {payload}) => {
                state.user = payload.user;
                state.access_token = payload.access_token;
                state.refresh_token = payload.refresh_token;
                localStorage.setItem("token", payload.access_token);
            })
            .addMatcher(usersApi.endpoints.editProfile.matchFulfilled, (state, {payload}) => {
                state.user = payload;
            })
    }
});

export const {setAuth, clearAuth} = authSlice.actions;

export default authSlice.reducer;