import "./index.scss";
import {FC, HTMLAttributes, useEffect} from "react";
import {useTypedSelector} from "../../redux/store";
import {getAvatar, isAvatarLoading} from "../../redux/reducers/chatsSlice";
import {useGetAvatarQuery} from "../../services/chats.api";
import {BsPeople} from "react-icons/bs";

type ChatAvatarProps = {
    chatId: number
    imgProps?: HTMLAttributes<HTMLImageElement>
}

const ChatAvatar: FC<ChatAvatarProps> = ({chatId, imgProps}) => {
    const avatar = useTypedSelector(getAvatar(chatId));
    const isLoading = useTypedSelector(isAvatarLoading(chatId));
    const {refetch: fetchAvatar} = useGetAvatarQuery(chatId);

    useEffect(() => {
        !isLoading && !avatar && fetchAvatar();
    }, []);

    return (
        avatar
            ? <img src={avatar} alt="" className={`chat-avatar ${imgProps?.className || ""}`}/>
            : <div className={`chat-avatar ${imgProps?.className || ""}`}><BsPeople/></div>
    );
}

export default ChatAvatar;