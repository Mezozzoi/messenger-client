import "./index.scss";
import {FC, ReactPortal, useState} from "react";
import {IUserModel} from "../../models/user";
import UserAvatar from "../user-avatar";
import UserProfile from "../popup-menu/presets/user-profile";
import {createPortal} from "react-dom";

interface UserItemProps {
    user: IUserModel,
}

const UserItem: FC<UserItemProps> = ({user}) => {
    const [portal, setPortal] = useState<ReactPortal | null>(null);

    const onClick = () => {
        setPortal(createPortal(<UserProfile userId={user.id} close={() => setPortal(null)}/>, document.body))
    }

    return (
        <div className={"user-item"} onClick={onClick}>
            {portal}

            <UserAvatar userId={user.id} className={"user-item__icon"}/>

            <div className={"user-item__body"}>
                <div className={"user-item__header"}>
                    <span className={"user-item__user-name"}>{`${user.firstname} ${user.lastname}`}</span>
                </div>
            </div>
        </div>
    )
}

export default UserItem;