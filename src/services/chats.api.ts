import {createApi} from "@reduxjs/toolkit/dist/query/react";
import IChatModel from "../models/chat";
import fetchBaseQueryWithReauth from "../redux/baseQueryWithReauth";
import {IUserModel} from "../models/user";

export type CreateGroupChat = {
    name: string,
    members?: number[]
}

export type CreateDialogueChat = {
    participant: number
}

export type EditChat = {
    chatId: number,
    name?: string,
    avatar?: FileList
}

export type FetchChatByIdResponse = Pick<IChatModel, "name" | "type" | "id"> | null

const chatsApi = createApi({
    reducerPath: "chatsApi",
    tagTypes: ["JoinedChats", "ChatAvatar"],
    baseQuery: fetchBaseQueryWithReauth("chats"),
    endpoints: (builder) => ({
        getJoinedChats: builder.query<IChatModel[], void>({
            query: () => ({url: "/joined"}),
            providesTags: (result, error, arg) =>
                result
                    ? [...result.map(e => ({type: "JoinedChats" as const, id: e.id})), "JoinedChats"]
                    : ["JoinedChats"]
        }),
        getChat: builder.query<IChatModel, number>({
            query: (args) => ({
                url: "/" + args
            }),
            providesTags: (result, error, arg) =>
                result
                    ? [{type: "JoinedChats" as const, id: arg}, "JoinedChats"]
                    : ["JoinedChats"]
        }),
        getChatById: builder.mutation<FetchChatByIdResponse, number>({
            query: (args) => ({
                url: "/" + args,
                method: "GET",
            })
        }),
        searchChats: builder.mutation<{ chats: IChatModel[], users: IUserModel[] }, { name: string }>({
            query: (args) => ({
                url: "/search",
                method: "GET",
                params: {name: args.name}
            })
        }),
        createGroupChat: builder.mutation<{ chatId: number }, CreateGroupChat>({
            query: (args) => ({
                url: "/createGroup",
                method: "POST",
                body: args
            }),
            invalidatesTags: (result, error, arg) =>
                result
                    ? ["JoinedChats"]
                    : []
        }),
        createDialogueChat: builder.mutation<{ chatId: number }, CreateDialogueChat>({
            query: (args) => ({
                url: "/createDialogue",
                method: "POST",
                body: args
            }),
            invalidatesTags: (result, error, arg) =>
                result
                    ? ["JoinedChats"]
                    : []
        }),
        joinChat: builder.mutation<void, { chatId: number }>({
            query: (args) => ({
                url: "/join",
                method: "POST",
                body: args
            }),
            invalidatesTags: (result, error, arg) =>
                !error
                    ? ["JoinedChats"]
                    : []
        }),
        leaveChat: builder.mutation<{ chatId: number }, { chatId: number }>({
            query: (args) => ({
                url: "/leave",
                method: "POST",
                body: args
            }),
            invalidatesTags: (result, error, arg) =>
                result
                    ? [{type: "JoinedChats", id: arg.chatId}]
                    : []
        }),
        deleteChat: builder.mutation<{ chatId: number }, { chatId: number }>({
            query: (args) => ({
                url: "/" + args.chatId,
                method: "DELETE"
            }),
            invalidatesTags: (result, error, arg) =>
                result
                    ? [{type: "JoinedChats", id: arg.chatId}]
                    : []
        }),
        editChat: builder.mutation<IChatModel, EditChat>({
            query: (args) => {
                const form = new FormData();

                args.avatar && form.append("avatar", Array.from(args.avatar)[0]);
                args.name && form.append("name", args.name);

                return {
                    url: `/edit/${args.chatId}`,
                    method: "POST",
                    body: form
                }
            }
        }),
        getAvatar: builder.query<string, number>({
            query: (args) => ({
                url: `/avatar/${args}`,
                method: "GET",
                responseHandler: (async (response) => {
                    const blob = await response.blob();
                    return blob.size === 0 ? "" : URL.createObjectURL(blob)
                }),
                cache: "no-cache"
            }),
            providesTags: (result, error, arg) =>
                [{type: "ChatAvatar", id: arg}]
        })
    })
})

export const {
    useGetAvatarQuery,
    useEditChatMutation,
    useCreateGroupChatMutation,
    useCreateDialogueChatMutation,
    useGetChatByIdMutation,
    useJoinChatMutation,
    useGetJoinedChatsQuery,
    useLeaveChatMutation,
    useSearchChatsMutation,
    useDeleteChatMutation
} = chatsApi;

export default chatsApi;