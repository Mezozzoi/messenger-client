import {createSelector, createSlice, PayloadAction} from "@reduxjs/toolkit";
import IMessageModel from "../../models/message";
import {RootState} from "../store";
import messagesApi from "../../services/messages.api";
import chatsApi from "../../services/chats.api";

export const getMessagesFromChat = (chatId: number) => createSelector(
    (state: RootState) => state.messagesSlice.chats[chatId] && state.messagesSlice.chats[chatId].messages,
    (messages) => messages && messages.length ? messages.slice().sort((a, b) =>
        a.createdAt === b.createdAt ? 0 : (a.createdAt > b.createdAt ? 1 : -1)) : []
)

export const getMessagesFromCurrentChat = createSelector(
    (state: RootState) => state.messagesSlice.chats,
    (state: RootState) => state.chatsSlice.currentChatId,
    (chats, chatId) => chatId && chats[chatId] ? chats[chatId].messages || [] : []
)

export const isCurrentChatCompletelyLoaded = createSelector(
    (state: RootState) => state.messagesSlice.chats,
    (state: RootState) => state.chatsSlice.currentChatId,
    (chats, chatId) => chatId && chats[chatId] ? chats[chatId].isCompletelyLoaded : false
)

export const getLastMessages = (state: RootState) =>
    Object.entries(state.messagesSlice.chats).map(([chatId, messages]) =>
        ({chatId: Number(chatId), message: getLastMessage(Number(chatId))(state)!}));

export const getLastMessage = (chatId: number) => createSelector(
    (state: RootState) => getMessagesFromChat(chatId)(state),
    (messages) => messages && messages.length > 0 ? messages.splice(-1)[0] : undefined
)

export const getEditingMessage = (state: RootState) => state.messagesSlice.editingMessage;

type InitialStateType = {
    chats: {
        [id: number]: {
            messages: IMessageModel[],
            isCompletelyLoaded: boolean
        }
    },
    editingMessage: IMessageModel | null
}

const initialState: InitialStateType = {
    chats: {},
    editingMessage: null
}

const pushMessage = (state: InitialStateType, message: IMessageModel, chatId: number) => {
    if (!state.chats[chatId]) state.chats[chatId] = {messages: [], isCompletelyLoaded: false};
    if (message) {
        const index = state.chats[chatId].messages.findIndex(e => e.id === message.id);
        if (index === -1) state.chats[chatId].messages.push(message);
    }
}

const messagesSlice = createSlice({
    name: "messages",
    initialState,
    reducers: {
        receive: (state, action: PayloadAction<IMessageModel>) => {
            state.chats[action.payload.chatId].messages.push(action.payload);
        },
        setCompletelyLoaded: (state, action: PayloadAction<{ chatId: number, isComplete: boolean }>) => {
            if (state.chats[action.payload.chatId])
                state.chats[action.payload.chatId].isCompletelyLoaded = action.payload.isComplete;
            else
                state.chats[action.payload.chatId] = {messages: [], isCompletelyLoaded: action.payload.isComplete};
        },
        deleteMessage: (state, action: PayloadAction<{ chatId: number, messageId: number }>) => {
            const chat = state.chats[action.payload.chatId]
            chat.messages.splice(chat.messages.findIndex(m => m.id === action.payload.messageId), 1)
        },
        updateMessage: (state, action: PayloadAction<IMessageModel>) => {
            const chat = state.chats[action.payload.chatId];
            if (!chat) return;

            const messageIndex = chat.messages.findIndex(e => e.id === action.payload.id);
            if (messageIndex >= 0) chat.messages[messageIndex] = action.payload;
        },
        setEditingMessage: (state, action: PayloadAction<IMessageModel | null>) => {
            state.editingMessage = action.payload;
        }
    },
    extraReducers: builder => {
        builder
            .addMatcher(messagesApi.endpoints.getMessagesByChatId.matchFulfilled, (state, action: PayloadAction<IMessageModel[]>) => {
                if (action.payload.length === 0) return;
                const chatId = action.payload[0].chatId;
                action.payload.forEach(m => pushMessage(state, m, chatId));
            })
            .addMatcher(messagesApi.endpoints.lazyLoadMessages.matchFulfilled, (state, action: PayloadAction<IMessageModel[]>) => {
                if (action.payload.length === 0) return;
                const chatId = action.payload[0].chatId;
                action.payload.forEach(m => pushMessage(state, m, chatId));
            })
            .addMatcher(messagesApi.endpoints.getLastMessage.matchFulfilled, (state, action: PayloadAction<{
                chatId: number,
                message: IMessageModel
            }>) => {
                const chatId = action.payload.chatId;
                pushMessage(state, action.payload.message, chatId);
            })
            .addMatcher(chatsApi.endpoints.leaveChat.matchFulfilled, (state, action: PayloadAction<{
                chatId: number
            }>) => {
                delete state.chats[action.payload.chatId];
            })
    }
})

export const {
    receive,
    setCompletelyLoaded,
    deleteMessage,
    updateMessage,
    setEditingMessage
} = messagesSlice.actions;

export default messagesSlice.reducer;