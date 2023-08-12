import {Mutex} from "async-mutex";
import {BaseQueryFn, FetchArgs, fetchBaseQuery, FetchBaseQueryError} from "@reduxjs/toolkit/dist/query/react";
import {clearAuth, getDecryptedToken, setAuth} from "./reducers/authSlice";
import {RootState} from "./store";
import {AuthType} from "../services/auth.api";

export type ApiExtraOptions = {
    noAuth?: boolean
}

const baseQuery = fetchBaseQuery({
    baseUrl: process.env["REACT_APP_API_PATH"],
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).authSlice.access_token;

        if (token) headers.set("authorization", `Bearer ${token}`);

        return headers
    },
    credentials: "include"
})

const mutex = new Mutex();

const fetchBaseQueryWithReauth = (baseUrl?: string): BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError,
    ApiExtraOptions | undefined
>  => {
    return async (args, api, extraOptions) => {
        if (baseUrl && typeof args !== "string") {
            args.url = (baseUrl + "/" + args.url).replaceAll("//", "/")
        }

        await mutex.waitForUnlock();

        let token = getDecryptedToken(api.getState() as RootState);

        if (!extraOptions?.noAuth && token && token.exp - 1 < Date.now() / 1000) {
            if (!mutex.isLocked()) {
                const release = await mutex.acquire();
                try {
                    const refreshResult = await baseQuery(
                        { url: '/auth/refresh', method: "POST" },
                        api,
                        extraOptions || {}
                    );
                    if (refreshResult.data) {
                        api.dispatch(setAuth(refreshResult.data as AuthType));
                    } else {
                        api.dispatch(clearAuth());
                    }
                } finally {
                    release();
                }
            } else {
                await mutex.waitForUnlock();
            }
        }

        return baseQuery(args, api, extraOptions || {});
    }
}

export default fetchBaseQueryWithReauth;