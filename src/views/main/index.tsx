import React, {useEffect, useState} from "react";
import "../../socket/socket";
import {useTypedSelector} from "../../redux/store";
import {Navigate, Route, Routes, useNavigate} from "react-router-dom";
import "./index.scss"
import socket from "../../socket/socket";
import ChatList from "../../components/chat-list";
import ChatView from "../../components/chat-view";
import {useGetJoinedChatsQuery} from "../../services/chats.api";
import JoinPopup from "../../components/popup-dialog/join-popup";
import Loader from "../../components/loader";
import {ContextMenuContext} from "../../contexts/context-menu.context";
import ContextMenu, {ContextMenuProps} from "../../components/context-menu";
import {removeNotification, requestNotification} from "../../services/fcm";
import {getUser} from "../../redux/reducers/authSlice";

const Main: React.FC = () => {
    useGetJoinedChatsQuery();

    const navigate = useNavigate();
    const user = useTypedSelector(getUser);
    const token = useTypedSelector(state => state.authSlice.access_token);
    const [isSocketOk, setIsSocketOk] = useState(true);
    const [contextMenuProps, setContextMenuProps] = useState<ContextMenuProps | null>(null);

    useEffect(() => {
        socket.auth = {token}
        token && socket.connect();

        return () => {
            socket.close();
            removeNotification();
        }
    }, [token]);

    useEffect(() => {
        socket.on("disconnect", () => {
            setIsSocketOk(false);
        })

        socket.on("connect", () => {
            setIsSocketOk(true);
        })

        requestNotification()
    }, [])

    if (!user) {
        navigate("/login");
        return null;
    }

    return (
        <ContextMenuContext.Provider value={{value: contextMenuProps, setValue: setContextMenuProps}}>
            <div className={"main-page"}>
                <ChatList/>

                <Routes>
                    <Route path={"/join/:chatId"} element={<JoinPopup/>}/>
                    <Route path={"/:chatId"} element={<ChatView/>}/>
                    <Route path={"/"} element={null}/>
                    <Route path={"*"} element={<Navigate to={"/"}/>}/>
                </Routes>

                {contextMenuProps && <ContextMenu {...contextMenuProps}/>}

                {!isSocketOk && <div className={"socket-status"}>Lost connection <Loader className={"loader"}/></div>}
            </div>
        </ContextMenuContext.Provider>
    );
}

export default Main;