import "./index.scss";
import PopupMenu from "../../index";
import {FC, ReactPortal, useState} from "react";
import {getAvatar, getChatById} from "../../../../redux/reducers/chatsSlice";
import {useTypedSelector} from "../../../../redux/store";
import MenuButton from "../../items/button";
import {
    useDeleteChatMutation,
    useEditChatMutation, useGetAvatarQuery,
    useLeaveChatMutation
} from "../../../../services/chats.api";
import MenuDivider from "../../items/divider";
import PopupDialog from "../../../popup-dialog";
import {getUser} from "../../../../redux/reducers/authSlice";
import {BsBoxArrowRight, BsGear, BsTrash} from "react-icons/bs";
import ChatAvatar from "../../../chat-avatar";
import {ChatType} from "../../../../models/chat";
import {useSendExceptionMutation} from "../../../../services/debug.api";
import UserAvatar from "../../../user-avatar";
import {createPortal} from "react-dom";

type ChatSettingsProps = {
    close: () => void,
    chatId: number
}

const ChatSettings: FC<ChatSettingsProps> = ({chatId, close}) => {
    const chat = useTypedSelector(getChatById(chatId))!;
    const user = useTypedSelector(getUser)!;
    const [leaveChat, leaveChatStatus] = useLeaveChatMutation();
    const [deleteChat, deleteChatStatus] = useDeleteChatMutation();
    const [portal, setPortal] = useState<ReactPortal | null>(null);
    const avatar = useTypedSelector(getAvatar(chatId));
    const [editChat, editChatStatus] = useEditChatMutation();
    const isOwner = user.id === chat.ownerId;
    useGetAvatarQuery(chatId);
    const [sendException] = useSendExceptionMutation();

    const leaveChatHandler = () => {
        setPortal(createPortal(<PopupDialog
            title={"Leave chat"}
            description={`Are you sure you want to leave ${chat.name}`}
            closeCb={() => setPortal(null)}
            actions={[
            {title: "Leave",
                cb: async () => {
                    try {
                        if (leaveChatStatus.isUninitialized && !leaveChatStatus.isLoading) {
                            await leaveChat({chatId: chat.id}).unwrap();
                        }
                    } catch (e) {
                        sendException(e);
                        console.error(e);
                        return "Error while trying to leave chat.";
                    }
                }
                },
            {title: "Cancel"}
        ]} />, document.body));
    }

    const deleteChatHandler = () => {
        setPortal(createPortal(<PopupDialog
            title={"Delete chat"}
            description={`Are you sure you want to delete ${chat.name}`}
            closeCb={() => setPortal(null)}
            actions={[
                {title: "Delete",
                    cb: async () => {
                        try {
                            if (deleteChatStatus.isUninitialized && !deleteChatStatus.isLoading) {
                                await deleteChat({chatId: chat.id}).unwrap();
                            }
                        } catch (e) {
                            sendException(e);
                            console.error(e);
                            return "Error while trying to delete chat.";
                        }

                        return undefined;
                    }},
                {title: "Cancel"}
            ]} />, document.body));
    }

    const editChatHandler = () => {
        setPortal(createPortal(<PopupDialog
            title={"Edit chat"}
            fields={[
                {title: "Avatar", type: "image", name: "avatar", options: {initialImage: avatar}},
                {title: "Name", type: "text", name: "name"}
            ]}
            actions={[
                {title: "Confirm",
                    cb: async fields => {
                        try {
                            !editChatStatus.isLoading && await editChat({
                                chatId: chat.id,
                                name: fields.find(e => e.name === "name")?.value,
                                avatar: fields.find(e => e.name === "avatar")?.value,
                            }).unwrap();
                        } catch (e) {
                            sendException(e);
                            console.error(e);
                            return "Error while trying to edit chat.";
                        }

                        return undefined;
                    }
                },
                {title: "Cancel"}
            ]}
            closeCb={() => setPortal(null)}/>, document.body));
    }

    return (
        <PopupMenu title={"Chat settings"} className={"chat-settings"} close={close}>
            <div className={"chat-settings__info"}>
                {chat.type === ChatType.GROUP
                    ? <ChatAvatar chatId={chatId} imgProps={{className: "chat-settings__avatar"}}/>
                    : <UserAvatar userId={chat.members.find(m => m.id !== user.id)!.id} className={"chat-settings__avatar"}/>}
                <div className={"chat-settings__title"}>{chat.name}</div>
            </div>

            {isOwner && chat.type === ChatType.GROUP &&
                <MenuButton title={"Edit chat"} onClick={editChatHandler} icon={<BsGear/>}/>}

            <MenuDivider/>

            {chat.type === ChatType.GROUP &&
                <MenuButton title={"Leave chat"} onClick={leaveChatHandler} type={"danger"} icon={<BsBoxArrowRight/>}/>}
            {(isOwner || chat.type === ChatType.DIALOGUE) &&
                <MenuButton title={"Delete chat"} onClick={deleteChatHandler} icon={<BsTrash/>} type={"danger"}/>}

            {portal}
        </PopupMenu>
    )
}

export default ChatSettings;