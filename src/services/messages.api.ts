import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import IMessageModel from "../models/message";
import fetchBaseQueryWithReauth from "../redux/baseQueryWithReauth";

export type SendMessage = {
    chatId: number,
    content?: string,
    attachments?: FileList
}

export type GetMessagesByChatId = {
    chatId: number,
    limit?: number,
    offset?: number
}

export type EditMessage = {
    id: number,
    content?: string,
    attachments?: FileList
}

const messagesApi = createApi({
    reducerPath: "messagesApi",
    baseQuery: fetchBaseQueryWithReauth("/messages"),
    endpoints: (builder) => ({
        getMessagesByChatId: builder.mutation<IMessageModel[], GetMessagesByChatId>({
            query: ({chatId, offset, limit}) => ({
                url: "/" + chatId,
                method: "GET",
                params: {limit, offset}
            })
        }),
        getLastMessage: builder.mutation<{ chatId: number, message: IMessageModel }, number>({
            query: (args) => ({
                url: "/" + args + "/last",
                method: "GET"
            })
        }),
        lazyLoadMessages: builder.mutation<IMessageModel[], GetMessagesByChatId>({
            query: ({chatId, offset, limit}) => ({
                url: "/" + chatId,
                method: "GET",
                params: {limit, offset}
            })
        }),
        sendMessage: builder.mutation<IMessageModel, SendMessage>({
            query: (args) => {
                if (!args.content && !args.attachments)
                    throw new Error("Content or attachments must be provided");

                const form = new FormData();
                form.append("chatId", String(args.chatId));
                args.content && form.append("content", args.content);
                args.attachments && Array.from(args.attachments).forEach(f => form.append("attachments", f));

                return {
                    url: "/send",
                    method: "POST",
                    body: form
                }
            }
        }),
        deleteMessage: builder.mutation<void, number>({
            query: (args) => ({
                url: "/" + args,
                method: "DELETE"
            })
        }),
        editMessage: builder.mutation<IMessageModel, EditMessage>({
            query: (args) => {
                if (!args.content && !args.attachments)
                    throw new Error("Content or attachments must be provided");

                const form = new FormData();
                form.append("id", String(args.id));
                args.content && form.append("content", args.content);
                args.attachments && Array.from(args.attachments).forEach(f => form.append("attachments", f));

                return {
                    url: "/edit",
                    method: "POST",
                    body: form
                }
            }
        })
    })
})

export const {
    useSendMessageMutation,
    useGetLastMessageMutation,
    useLazyLoadMessagesMutation,
    useGetMessagesByChatIdMutation,
    useDeleteMessageMutation,
    useEditMessageMutation
} = messagesApi;

export default messagesApi;