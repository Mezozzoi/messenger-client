import {createSelector, createSlice, PayloadAction} from "@reduxjs/toolkit";
import IChatModel, {ChatType} from "../../models/chat";
import chatsApi from "../../services/chats.api";
import {RootState} from "../store";

export const getChatById = (chatId: number) => (state: RootState) =>
    state.chatsSlice.chats.find(e => e.id === chatId) || null

export const isAvatarLoading = (chatId: number) => (state: RootState) => {
    return Boolean(state.chatsSlice.chats.find(e => e.id === chatId)?.avatar?.isLoading);
}

export const getAvatar = (chatId: number) => (state: RootState) => {
    return state.chatsSlice.chats.find(e => e.id === chatId)?.avatar?.data;
}

export const isChatJoined = createSelector(
    (state: RootState, chatId: number) => getChatById(chatId)(state),
    (chat) => !!chat
)

export const getCurrentChat = (state: RootState) => {
    if (!state.chatsSlice.currentChatId) return null;
    return getChatById(state.chatsSlice.currentChatId)(state);
}

export const getDialogue = (participant: number) => (state: RootState) => {
    return state.chatsSlice.chats.find(c =>
        c.type === ChatType.DIALOGUE &&
        c.members.find(m => m.id === participant)
    ) || null;
}

export const getChats = (state: RootState) => state.chatsSlice.chats;

const setChats = (state: InitialState, chats: IChatModel[]) => {
    chats.forEach(chat => {
        const chatIndex = state.chats.findIndex(c => c.id === chat.id);
        if (chatIndex >= 0)
            state.chats[chatIndex] = Object.assign(state.chats[chatIndex], chat);
        else
            state.chats.push(chat);
    });

    state.chats = state.chats.filter(chat => chats.find(_chat => chat.id === _chat.id));
}

type InitialState = {
    chats: IChatModel[],
    currentChatId: number | null
}

const initialState: InitialState = {
    chats: [],
    currentChatId: null
}

const chatsSlice = createSlice({
    name: "chats",
    initialState,
    reducers: {
        setCurrentChat: (state, action: PayloadAction<IChatModel | number>) => {
            if (typeof action.payload === "number")
                state.currentChatId = action.payload;
            else state.currentChatId = state.chats.find(e => e.id === action.payload)?.id || null;
        },
        clearCurrentChat: (state) => {
            state.currentChatId = null;
        },
        updateChat: (state, action: PayloadAction<IChatModel>) => {
            const chatIndex = state.chats.findIndex(e => e.id === action.payload.id);
            if (chatIndex >= 0) state.chats[chatIndex] = Object.assign({}, state.chats[chatIndex], action.payload);
        }
    },
    extraReducers: builder => {
        builder
            .addMatcher(chatsApi.endpoints.getJoinedChats.matchFulfilled, (state, action) => {
                setChats(state, action.payload)
                // state.chats = action.payload;
            })
            .addMatcher(chatsApi.endpoints.getChat.matchFulfilled, (state, action) => {
                const chatIndex = state.chats.findIndex(e => e.id === action.meta.arg.originalArgs);
                if (chatIndex) state.chats[chatIndex] = action.payload;
                else state.chats.push(action.payload);
            })
            .addMatcher(chatsApi.endpoints.leaveChat.matchFulfilled, (state, action: PayloadAction<{chatId: number}>) => {
                state.chats = state.chats.filter(e => e.id !== action.payload.chatId);
            })
            .addMatcher(chatsApi.endpoints.getAvatar.matchPending, (state, action) => {
                const chat = state.chats.find(e => e.id === action.meta.arg.originalArgs);
                if (chat) {
                    if (!chat.avatar) chat.avatar = {data: "", isLoading: true};
                    else chat.avatar.isLoading = true;
                }
            })
            .addMatcher(chatsApi.endpoints.getAvatar.matchFulfilled, (state, action) => {
                const chat = state.chats.find(e => e.id === action.meta.arg.originalArgs);
                if (chat) {
                    if (!chat.avatar) chat.avatar = {data: action.payload, isLoading: false};
                    else  {
                        chat.avatar.data = action.payload;
                        chat.avatar.isLoading = false;
                    }
                }
            })
    }
});

export const {updateChat, setCurrentChat, clearCurrentChat} = chatsSlice.actions;

export default chatsSlice.reducer;