import React, {
    useEffect,
} from "react";
import {useAppDispatch, useTypedSelector} from "../../redux/store";
import "./index.scss";
import {useParams} from "react-router-dom";
import {clearCurrentChat, getCurrentChat, setCurrentChat} from "../../redux/reducers/chatsSlice";
import ChatInput from "./chat-input";
import ChatBody from "./chat-body";
import ChatHeader from "./chat-header";

type Props = {}

const ChatView: React.FC<Props> = () => {
    const {chatId} = useParams();
    const dispatch = useAppDispatch();
    const chat = useTypedSelector(getCurrentChat);

    useEffect(() => {
        if (chatId) {
            dispatch(setCurrentChat(+chatId));
        } else {
            dispatch(clearCurrentChat());
        }
    }, [chatId])


    return (
        chat &&
        <main id={"chat-view"}>
            <ChatHeader/>

            <ChatBody/>

            <ChatInput/>
        </main>
    )
}

export default ChatView;