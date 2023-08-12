import React, {FC, ReactPortal, useEffect, useMemo, useRef, useState} from "react";
import ChatMessage from "../../chat-message";
import {useGetMessagesByChatIdMutation, useLazyLoadMessagesMutation} from "../../../services/messages.api";
import {useAppDispatch, useTypedSelector} from "../../../redux/store";
import {
    getMessagesFromCurrentChat,
    isCurrentChatCompletelyLoaded,
    setCompletelyLoaded
} from "../../../redux/reducers/messagesSlice";
import {getCurrentChat} from "../../../redux/reducers/chatsSlice";
import "./index.scss";
import Loader from "../../loader";
import {createPortal} from "react-dom";
import PopupMessage from "../../popup-message";

const ChatBody: FC = () => {
    const dispatch = useAppDispatch();
    const [fetchMessages, fetchMessagesStatus] = useGetMessagesByChatIdMutation();
    const [lazyLoadMessages, lazyLoadingMessagesStatus] = useLazyLoadMessagesMutation();
    const messages = useTypedSelector(getMessagesFromCurrentChat);
    const chatBottomRef = useRef<HTMLDivElement>(null);
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const chat = useTypedSelector(getCurrentChat);
    const isCompletelyLoaded = useTypedSelector(isCurrentChatCompletelyLoaded);
    const [portal, setPortal] = useState<ReactPortal | null>(null);

    const messagesElement = useMemo(() => {
        return messages
            .slice()
            .sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((m) => {
                return <ChatMessage key={m.id} id={m.id} chatId={m.chatId} owner={m.owner}
                                    content={m.content} updatedAt={m.updatedAt}
                                    attachments={m.attachments} createdAt={m.createdAt}/>
            })
    }, [messages]);

    useEffect(() => {
        if (messages.length < 20 && !isCompletelyLoaded) {
            (async () => {
                try {
                    if ((await fetchMessages({chatId: chat!.id}).unwrap()).length < 20) {
                        dispatch(setCompletelyLoaded({chatId: chat!.id, isComplete: true}));
                    }
                } catch (e) {
                    console.error(e);
                    setPortal(createPortal(
                        <PopupMessage title={"Error"} message={"Fetching messages error."} icon={"error"}
                                      close={() => setPortal(null)}/>,
                        document.body))
                }
            })()
        }
    }, [chat]);

    const scrollBottomRef = useRef(0);
    const onScroll = async () => {
        scrollBottomRef.current = (chatBodyRef.current?.scrollHeight || 0) + (chatBodyRef.current?.scrollTop || 0) - (chatBodyRef.current?.clientHeight || 0);
        if (scrollBottomRef.current < 20 && !lazyLoadingMessagesStatus.isLoading) {
            try {
                if (!isCompletelyLoaded)
                    if ((await lazyLoadMessages({chatId: chat!.id, offset: messages.length}).unwrap()).length === 0)
                        dispatch(setCompletelyLoaded({chatId: chat!.id, isComplete: true}))
            } catch (e) {
                setPortal(createPortal(
                    <PopupMessage title={"Error"} message={"Loading messages error."} icon={"error"}
                                  close={() => setPortal(null)}/>,
                    document.body))
            }
        }
    }

    return (
        <div id={"chat-view__body"} ref={chatBodyRef} onScroll={onScroll}>
            <Loader isLoading={fetchMessagesStatus.isLoading}>
                <div ref={chatBottomRef}></div>
                {messagesElement}
                {isCompletelyLoaded ? null : <Loader isSpread={false}/>}
            </Loader>

            {portal}
        </div>
    )
}

export default ChatBody;