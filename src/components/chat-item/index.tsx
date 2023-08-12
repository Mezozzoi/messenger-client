import "./index.scss";
import {FC} from "react";
import {Link} from "react-router-dom";
import {useTypedSelector} from "../../redux/store";
import {isChatJoined} from "../../redux/reducers/chatsSlice";
import {getLastMessage} from "../../redux/reducers/messagesSlice";
import ChatAvatar from "../chat-avatar";
import IChatModel, {ChatType} from "../../models/chat";
import UserAvatar from "../user-avatar";
import {getUser} from "../../redux/reducers/authSlice";

interface ChatItemProps {
    chat: IChatModel
}

const ChatItem: FC<ChatItemProps> = ({chat}: ChatItemProps) => {
    const isJoined = useTypedSelector(state => isChatJoined(state, chat.id));
    const lastMessage = useTypedSelector(getLastMessage(chat.id));
    const user = useTypedSelector(getUser)!;

    return (
        <Link to={(isJoined ? "/" : "/join/") + String(chat.id)} className={`chat-item`}>
            {
                chat.type === ChatType.DIALOGUE
                    ? <UserAvatar userId={chat.members.find(m => m.id !== user.id)!.id} className={"chat-item__icon"}/>
                    : <ChatAvatar chatId={chat.id} imgProps={{className: "chat-item__icon"}}/>
            }

            <div className={"chat-item__body"}>
                <div className={"chat-item__header"}>
                    <span className={"chat-item__chat-name"}>{chat.name}</span>
                    { lastMessage
                        ? <span className={"chat-item__message-time"}>{new Date(lastMessage.createdAt).toLocaleTimeString("eu-EU", {timeStyle: "short"})}</span>
                        : null}
                </div>


                <div className={"chat-item__message"}>
                    {lastMessage
                        ? <span className={"chat-item__message-owner"}>
                            {lastMessage.owner.firstname + " " + lastMessage.owner.lastname}:
                        </span>
                        : null}
                    <span className={"chat-item__message-content"}>
                        {lastMessage
                            ? lastMessage.attachments.length > 0
                                ? <i>{`${lastMessage.attachments.length} attachment${lastMessage.attachments.length === 1 ? "" : "s"}`}</i>
                                : lastMessage.content
                            : isJoined ? "No messages yet." : "Join this chat"}
                    </span>
                </div>
            </div>

        </Link>
    )
}

export default ChatItem;