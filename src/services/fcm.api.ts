import {createApi} from "@reduxjs/toolkit/dist/query/react";
import fetchBaseQueryWithReauth from "../redux/baseQueryWithReauth";

const fcmApi = createApi({
    baseQuery: fetchBaseQueryWithReauth("/fcm"),
    reducerPath: "fcmApi",
    endpoints: builder => ({
        registerToken: builder.mutation<void, string>({
            query: args => ({
                url: "/registerToken",
                method: "POST",
                body: {
                    token: args
                }
            })
        })
    })
})

export const {useRegisterTokenMutation} = fcmApi;

export default fcmApi;