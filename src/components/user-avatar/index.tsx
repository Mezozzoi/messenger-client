import "./index.scss"
import {FC, MouseEventHandler, useEffect} from "react";
import {useTypedSelector} from "../../redux/store";
import {getAvatar, isAvatarLoading} from "../../redux/reducers/usersSlice";
import {useGetAvatarMutation} from "../../services/users.api";
import {BsPerson} from "react-icons/bs";

type UserAvatarProps = {
    userId: number,
    onClick?: MouseEventHandler,
    className?: string
}

const UserAvatar: FC<UserAvatarProps> = ({userId, onClick, className}) => {
    const avatar = useTypedSelector(getAvatar(userId));
    const isLoading = useTypedSelector(isAvatarLoading(userId));
    const [fetchAvatar] = useGetAvatarMutation();

    useEffect(() => {
        !isLoading && !avatar && fetchAvatar(userId);
    }, []);

    return (
        avatar
            ? <img src={avatar} alt="" className={`user-avatar ${className || ""}`} onClick={onClick}/>
            : <div className={`user-avatar ${className || ""}`} onClick={onClick}><BsPerson/></div>
    );
}

export default UserAvatar;