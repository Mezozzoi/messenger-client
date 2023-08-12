import {createApi} from "@reduxjs/toolkit/dist/query/react";
import fetchBaseQueryWithReauth from "../redux/baseQueryWithReauth";

const debugApi = createApi({
    reducerPath: "debugApi",
    baseQuery: fetchBaseQueryWithReauth("debug"),
    endpoints: (builder) => ({
        sendException: builder.mutation<boolean, any>({
            query: (args) => ({
                url: "/exception",
                method: "POST",
                body: args
            })
        })
    })
})

export const {useSendExceptionMutation} = debugApi;

export default debugApi;