import "./index.scss";
import {FC, ReactElement, useState} from "react";
import {BsBoxArrowRight, BsPeople, BsPersonGear} from "react-icons/bs";
import {getUser} from "../../redux/reducers/authSlice";
import {useAppDispatch, useTypedSelector} from "../../redux/store";
import Button from "../button";
import {useLogoutMutation} from "../../services/auth.api";
import PopupDialog from "../popup-dialog";
import {useCreateGroupChatMutation} from "../../services/chats.api";
import ProfileSettings from "../popup-menu/presets/profile-settings";
import UserAvatar from "../user-avatar";
import {useSendExceptionMutation} from "../../services/debug.api";

type SidebarProps = {
    onClose: () => void
}

const Sidebar: FC<SidebarProps> = ({onClose}) => {
    const [isClosing, setIsClosing] = useState(false);
    const user = useTypedSelector(getUser)!;
    const [logout, logoutStatus] = useLogoutMutation();
    const [createGroup, createGroupStatus] = useCreateGroupChatMutation();
    const [popup, setPopup] = useState<ReactElement | null>(null);
    const [sendException] = useSendExceptionMutation();

    const close = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 250);
    }

    const onLogout = async () => {
        setPopup(<PopupDialog
            title={"Logout"}
            description={"Are you sure you want to log out?"}
            closeCb={() => setPopup(null)}
            actions={[
                {
                    title: "Log out",
                    cb: async () => {
                        try {
                            await logout().unwrap();
                        } catch (e) {
                            sendException(e);
                            return "Error while trying to logout.";
                        }

                        return undefined;
                    }
                },
                {title: "Cancel"}
            ]}/>)
    }

    const onCreateGroupChat = async () => {
        setPopup(<PopupDialog
            title={"Create group chat"}
            closeCb={() => setPopup(null)}
            fields={[
                {title: "Chat name", name: "chatName", type: "text", options: {placeholder: "Chat name"}}
            ]}
            actions={[
                {
                    title: "Create",
                    cb: async (fields) => {
                        try {
                            if (!createGroupStatus.isLoading) {
                                let name = fields.find(e => e.name === "chatName")?.value;
                                if (!name) return undefined;
                                await createGroup({name}).unwrap();
                            }
                        } catch (e) {
                            sendException(e);
                            return "Error while creating group."
                        }

                        return undefined;
                    },
                    validate: async (fields) => {
                        const name: string = fields.find(e => e.name === "chatName")?.value;

                        if (!name || name.length < 3 || name.length > 100) {
                            return "Chat name must be 3-100 symbols.";
                        }

                        return undefined;
                    }
                },
                {title: "Cancel"}
            ]}/>)
    }

    const onProfileSettings = () => {
        setPopup(<ProfileSettings close={() => setPopup(null)}/>);
    }

    return (
        <div id={"sidebar-container"} className={`${isClosing ? "closing" : ""}`}>
            <div id={"sidebar-mask"} onClick={(e) => e.target === e.currentTarget && close()}></div>

            {popup}

            <div id={"sidebar"}>
                <div className={"profile-info"} onClick={onProfileSettings}>
                    <UserAvatar className={"avatar"} userId={user.id}/>
                    <div className={"details"}>
                        <div className={"name"}>{user.firstname + " " + user.lastname}</div>
                        <div className={"id"}>{user.id}</div>
                    </div>
                </div>

                <Button title={"Create group chat"} onClickHandler={onCreateGroupChat} icon={<BsPeople/>}
                        className={"option"} styleType={"plain"}/>
                <Button title={"Profile settings"} onClickHandler={onProfileSettings} icon={<BsPersonGear/>}
                        className={"option"} styleType={"plain"}/>

                <Button title={"Logout"} onClickHandler={onLogout} icon={<BsBoxArrowRight/>} className={"logout option"}
                        styleType={"plain"}/>
            </div>
        </div>
    )
}

export default Sidebar;