import {FC, ReactPortal, useEffect, useState} from "react";
import PopupDialog from "../index";
import {useNavigate, useParams} from "react-router-dom";
import {FetchChatByIdResponse, useGetChatByIdMutation, useJoinChatMutation} from "../../../services/chats.api";
import Loader from "../../loader";
import {useSendExceptionMutation} from "../../../services/debug.api";
import {createPortal} from "react-dom";
import PopupMessage from "../../popup-message";

type JoinPopupProps = {}

const JoinPopup: FC<JoinPopupProps> = () => {
    const {chatId} = useParams();
    const [fetchChat, fetchChatStatus] = useGetChatByIdMutation();

    const [isClosing, setClosing] = useState(false);
    const [joinChat] = useJoinChatMutation();
    const navigate = useNavigate();
    const [chat, setChat] = useState<FetchChatByIdResponse>(null);
    const [sendException] = useSendExceptionMutation();
    const [portal, setPortal] = useState<ReactPortal | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setChat(await fetchChat(+chatId!).unwrap());
            } catch {
                setPortal(createPortal(
                    <PopupMessage title={"Failed to join chat"} icon={"error"} close={() => setPortal(null)}
                                  message={"You are not allowed to join this chat or chat doesn't exist."}/>,
                    document.body))
                setClosing(true);
            }
        })()
    }, []);

    const handleJoin = async () => {
        try {
            await joinChat({chatId: +chatId!}).unwrap();
        } catch (e) {
            sendException(e);
            console.error(e);
            return "Failed to join chat.";
        } finally {
            setClosing(true);
        }
    }

    const handleClose = () => {
        setClosing(true);
    }

    if (isClosing) navigate(-1);
    return (
        <Loader isLoading={fetchChatStatus.isLoading || fetchChatStatus.isUninitialized} absolute={true}>
            <PopupDialog title={"Join chat"}
                         closeCb={handleClose}
                         description={`You are not a member of this chat.\nAre you sure you want to join ${chat?.name}?`}
                         actions={[
                             {title: "Join", cb: handleJoin},
                             {title: "Cancel"}
                         ]}/>
            {portal}
        </Loader>
    )
}

export default JoinPopup;