import "./index.scss";
import React, {FC, ReactPortal, useState} from "react";
import {BsXLg} from "react-icons/bs";
import {useNavigate} from "react-router-dom";
import {useAppDispatch, useTypedSelector} from "../../../redux/store";
import {clearCurrentChat, getCurrentChat} from "../../../redux/reducers/chatsSlice";
import ChatSettings from "../../popup-menu/presets/chat-settings";
import {createPortal} from "react-dom";

const ChatHeader: FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const chat = useTypedSelector(getCurrentChat)!;
    const [portal, setPortal] = useState<ReactPortal | null>(null);

    const openChatMenu = () => {
        setPortal(createPortal(<ChatSettings chatId={chat.id} close={closeChatMenu}/>, document.body));
    }

    const closeChatMenu = () => {
        setPortal(null);
    }

    const closeChat = () => {
        dispatch(clearCurrentChat());
        navigate("/");
    }

    return (
        <header id={"chat-view__header"}>
            <button id={"chat-view__chat-name"} onClick={openChatMenu}>
                {chat!.name}
            </button>
            <button id={"chat-view__close"} onClick={closeChat}>
                <BsXLg size={20}/>
            </button>

            {portal}
        </header>
    )
}

export default ChatHeader;