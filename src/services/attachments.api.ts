import {createApi} from "@reduxjs/toolkit/dist/query/react";
import fetchBaseQueryWithReauth from "../redux/baseQueryWithReauth";

export type GetAttachment = {
    id: number
}

const attachmentsApi = createApi({
    reducerPath: "attachmentsApi",
    baseQuery: fetchBaseQueryWithReauth("/attachments"),
    endpoints: (builder) => ({
        getAttachment: builder.mutation<any, GetAttachment>({
            query: (args) => ({
                url: "/" + args.id,
                responseHandler: (async (response) => URL.createObjectURL(await response.blob())),
                cache: "no-cache"
            })
        })
    })
})

export const {useGetAttachmentMutation} = attachmentsApi;

export default attachmentsApi;