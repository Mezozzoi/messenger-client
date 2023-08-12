import {FC, MouseEventHandler, ReactPortal, useContext, useState} from "react";
import MessageAttachment from "./message-attachment";
import "./index.scss";
import {useAppDispatch, useTypedSelector} from "../../redux/store";
import {getUser} from "../../redux/reducers/authSlice";
import stringToColor from "../../common/string-to-color";
import IMessageModel from "../../models/message";
import UserAvatar from "../user-avatar";
import UserProfileMenu from "../popup-menu/presets/user-profile";
import ProfileSettings from "../popup-menu/presets/profile-settings";
import {ContextMenuContext} from "../../contexts/context-menu.context";
import {useDeleteMessageMutation} from "../../services/messages.api";
import {setEditingMessage} from "../../redux/reducers/messagesSlice";
import {useMediaQuery} from "react-responsive";
import {BsFiles, BsPencil, BsTrash} from "react-icons/bs";
import {createPortal} from "react-dom";

type MessageProps = IMessageModel & {}

const ChatMessage: FC<MessageProps> = ({id, owner, chatId, attachments, createdAt, content, updatedAt}) => {
    const dispatch = useAppDispatch();
    const user = useTypedSelector(getUser)!;
    const [portal, setPortal] = useState<ReactPortal | null>(null);
    const {setValue: setContextMenu} = useContext(ContextMenuContext);
    const [deleteMessage, deleteMessageStatus] = useDeleteMessageMutation();
    const isMobile = useMediaQuery({query: "(max-width: 600px)"});

    const showContextMenu: MouseEventHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();

        setContextMenu({
            position: {top: e.pageY, left: e.pageX},
            fields: [
                ...((owner.id === user.id &&
                    [
                        {
                            title: "Delete message",
                            icon: <BsTrash/>,
                            type: "danger",
                            cb: () => !deleteMessageStatus.isLoading && deleteMessage(id)
                        },
                        {
                            title: "Edit message",
                            icon: <BsPencil/>,
                            cb: () => dispatch(setEditingMessage({
                                id,
                                owner,
                                chatId,
                                content,
                                createdAt,
                                attachments,
                                updatedAt
                            }))
                        }
                    ]) || []),
                {title: "Copy message", icon: <BsFiles/>, cb: onCopyMessage},
            ],
            close: () => setContextMenu(null)
        });

        return false;
    }

    const onCopyMessage = () => {
        content && navigator.clipboard.writeText(content);
    }

    const onOpenUserProfile = () => {
        if (user.id === owner.id) setPortal(createPortal(<ProfileSettings
            close={() => setPortal(null)}/>, document.body));
        else setPortal(createPortal(<UserProfileMenu userId={owner.id}
                                                     close={() => setPortal(null)}/>, document.body));
    }

    return (
        <div className={`chat-message ${owner.id === user!.id ? "own" : ""}`}
             {...isMobile
                 ? {onClick: showContextMenu}
                 : {onContextMenu: showContextMenu}}>
            {portal}

            <UserAvatar userId={owner.id} className={"chat-message__avatar"} onClick={(e) => {
                e.stopPropagation();
                onOpenUserProfile();
            }}/>

            <div className={"chat-message__container"}>
                {owner.id !== user.id && <span className={"chat-message__name"} onClick={onOpenUserProfile}
                                               style={{color: stringToColor(owner.firstname + " " + owner.lastname)}}>{owner.firstname + " " + owner.lastname}</span>}

                {attachments.length > 0 &&
                    <div className={"chat-message__attachments"}>
                        {attachments.map((e, i) => <MessageAttachment key={i} type={e.type} id={e.id}
                                                                      filename={e.filename} size={e.size}/>)}
                    </div>}

                <div className={"chat-message__body"}>
                    <span className={"chat-message__content"}>{content || ""}</span>
                    <span
                        className={"chat-message__time"}>{new Date(createdAt).toLocaleTimeString("eu-EU", {timeStyle: "short"})}</span>
                </div>
            </div>
        </div>
    )
}

export default ChatMessage;