import {createApi} from "@reduxjs/toolkit/dist/query/react";
import fetchBaseQueryWithReauth from "../redux/baseQueryWithReauth";
import {IUserModel} from "../models/user";

export type AuthType = {
    access_token: string,
    refresh_token: string,
    user: IUserModel
}

export type RegisterUser = {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
}

const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQueryWithReauth("auth"),
    endpoints: (builder) => ({
        refresh: builder.mutation<AuthType, void>({
            query: () => ({
                url: "/refresh",
                method: "POST"
            }),
            extraOptions: {
                noAuth: true
            }
        }),
        login: builder.mutation<AuthType, { password: string, login: string }>({
            query: (body: { login: string, password: string }) => ({
                url: "/login",
                method: "POST",
                body: {email: body.login, password: body.password}
            }),
            extraOptions: {
                noAuth: true
            }
        }),
        logout: builder.mutation<void, void>({
            query: () => ({
                url: "/logout",
                method: "POST"
            })
        }),
        register: builder.mutation<AuthType, RegisterUser>({
            query: (params) => ({
                url: "/register",
                method: "POST",
                body: params
            }),
            extraOptions: {
                noAuth: true
            }
        })
    })
});

export const {useRefreshMutation, useLoginMutation, useLogoutMutation, useRegisterMutation} = authApi;

export default authApi;