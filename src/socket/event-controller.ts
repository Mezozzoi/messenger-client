import Event from "./decorators/event.decorator";
import {deleteMessage, receive, updateMessage} from "../redux/reducers/messagesSlice";
import type IMessageModel from "../models/message";
import store from "../redux/store";
import {updateChat} from "../redux/reducers/chatsSlice";
import type IChatModel from "../models/chat";
import chatsApi from "../services/chats.api";
import {IUserModel} from "../models/user";
import usersApi from "../services/users.api";
import {updateUser} from "../redux/reducers/usersSlice";
import goofyAhh from "../assets/goofy-ahh.mp3";

const notificationSound = new Audio(goofyAhh);
notificationSound.volume = 0.25

export default class EventController {
    @Event("receiveMessage")
    async handleMessageReceived(message: IMessageModel) {
        store.dispatch(receive(message));
        if (store.getState().authSlice.user!.id !== message.ownerId) {
            try {
                await notificationSound.play();
            } catch (e) {}
        }
    }

    @Event("chatDeleted")
    async handleChatDeleted(chatId: string) {
        await store.dispatch(chatsApi.endpoints.getJoinedChats.initiate(undefined, {
            forceRefetch: true,
            subscribe: false
        }));
    }

    @Event("chatEdited")
    async handleChatEdited({chat, isAvatarEdited}: { chat: IChatModel, isAvatarEdited: boolean }) {
        store.dispatch(updateChat(chat));
        if (isAvatarEdited) {
            await store.dispatch(chatsApi.endpoints.getAvatar.initiate(chat.id, {
                forceRefetch: true,
                subscribe: false
            }));
        }
    }

    @Event("joinedToChat")
    async handleJoinedToChat({chatId}: { chatId: number }) {
        await store.dispatch(chatsApi.endpoints.getJoinedChats.initiate(undefined, {
            forceRefetch: true,
            subscribe: false
        }));
    }

    @Event("userEdited")
    async handleUserEdited({user, isAvatarEdited}: { user: IUserModel, isAvatarEdited: boolean }) {
        store.dispatch(updateUser(user));
        if (isAvatarEdited) {
            await store.dispatch(usersApi.endpoints.getAvatar.initiate(user.id));
        }
    }

    @Event("messageDeleted")
    async handleMessageDeleted({chatId, messageId}: { chatId: number, messageId: number }) {
        store.dispatch(deleteMessage({chatId, messageId}));
    }

    @Event("messageEdited")
    async handleMessageEdited({message}: { message: IMessageModel }) {
        store.dispatch(updateMessage(message));
    }
}