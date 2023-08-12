import "./index.scss";
import {FC, useEffect, useState} from "react";
import {useGetUserMutation} from "../../../../services/users.api";
import {IUserModel} from "../../../../models/user";
import PopupMenu from "../../index";
import MenuButton from "../../items/button";
import UserAvatar from "../../../user-avatar";
import MenuDivider from "../../items/divider";
import {useCreateDialogueChatMutation} from "../../../../services/chats.api";
import {useNavigate} from "react-router-dom";
import {useTypedSelector} from "../../../../redux/store";
import {getDialogue} from "../../../../redux/reducers/chatsSlice";

type UserProfileMenuProps = {
    userId: number,
    close: () => void
}

const UserProfileMenu: FC<UserProfileMenuProps> = ({userId, close}) => {
    const [fetchUser, fetchUserStatus] = useGetUserMutation();
    const [user, setUser] = useState<IUserModel | null>(null);
    const [createDialogue, createDialogueStatus] = useCreateDialogueChatMutation();
    const dialogue = useTypedSelector(getDialogue(userId));
    const navigate = useNavigate();

    const onSendMessage = async () => {
        if (dialogue) {
            navigate(`/${dialogue.id}`);
            close();
        }
        else if (!createDialogueStatus.isLoading) {
            const res = await createDialogue({participant: user!.id}).unwrap();
            navigate(`/${res.chatId}`);
            close();
        }
    }

    useEffect(() => {
        fetchUser(userId).unwrap().then(user => setUser(user))
    }, []);

    if (!user) return <></>;

    return (
        <PopupMenu title={"User profile"} close={close} className={"user-profile"}>
            <UserAvatar userId={user.id}/>
            <MenuDivider/>
            <MenuButton title={"Send message"} onClick={onSendMessage}/>
        </PopupMenu>
    );
}

export default UserProfileMenu;