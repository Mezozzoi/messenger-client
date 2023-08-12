import "./index.scss";
import {ChangeEventHandler, FC, useEffect, useMemo, useState} from "react";
import IChatModel from "../../models/chat";
import {useTypedSelector} from "../../redux/store";
import ChatItem from "../chat-item";
import Input from "../input";
import {useSearchChatsMutation} from "../../services/chats.api";
import Loader from "../loader";
import {getChats, getCurrentChat} from "../../redux/reducers/chatsSlice";
import {useGetLastMessageMutation} from "../../services/messages.api";
import IconButton from "../icon-button";
import {BsList, BsXLg} from "react-icons/bs";
import Sidebar from "../sidebar";
import {IUserModel} from "../../models/user";
import UserItem from "../user-item";
import {useMediaQuery} from "react-responsive";
import {getLastMessages} from "../../redux/reducers/messagesSlice";
import IMessageModel from "../../models/message";

const ChatList: FC = () => {
    const chats = useTypedSelector(getChats);
    const chat = useTypedSelector(getCurrentChat);
    const [searchInput, setSearchInput] = useState("");
    const [searchChats, searchChatsStatus] = useSearchChatsMutation();
    const [foundChats, setFoundChats] = useState<{ chats: IChatModel[], users: IUserModel[] }>({chats: [], users: []});
    const [fetchLastMessage] = useGetLastMessageMutation();
    const [isSidebarActive, setSidebarActive] = useState(false);
    const isMobile = useMediaQuery({query: "(max-width: 600px)"});
    const lastMessages = useTypedSelector(getLastMessages);

    useEffect(() => {
        chats.forEach(c => fetchLastMessage(c.id).unwrap());
    }, [chats]);

    const joinedChatsNode = useMemo(() => {
        const _chats = chats.map(chat => ({...chat})) as (IChatModel & { lastMessage?: IMessageModel })[];
        for (let chat of _chats)
            chat.lastMessage = lastMessages.find(m => m.chatId === chat.id)?.message;

        _chats.sort((a, b) =>
            -Date.parse(a.lastMessage?.createdAt || a.createdAt) + Date.parse(b.lastMessage?.createdAt || b.createdAt));

        return (
            <div className={"joined-chats"}>
                {_chats.map((chat) =>
                    <ChatItem key={chat.id} chat={chat}/>)}
            </div>
        )
    }, [chats, lastMessages])

    useEffect(() => {
        (async () => {
            if (searchInput.length > 0) {
                setFoundChats(await searchChats({name: searchInput}).unwrap());
            }
        })()
    }, [searchInput]);

    const handleSearchChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setSearchInput(e.target.value);
    }

    const handleClearSearch = () => {
        setSearchInput("");
    }

    const openSidebar = () => {
        setSidebarActive(true);
    }

    const closeSidebar = () => {
        setSidebarActive(false);
    }

    return (
        <div id={"chat-list"} style={{display: isMobile && chat ? "none" : ""}}>
            {isSidebarActive ? <Sidebar onClose={closeSidebar}/> : null}
            <div id={"chat-list__header"}>
                <IconButton onClickHandler={openSidebar} icon={<BsList/>} type={"plain"}/>
                <div id={"chat-search"}>
                    <Input placeholder={"Search"} onChange={handleSearchChange} value={searchInput}/>
                    {searchInput &&
                        <IconButton onClickHandler={handleClearSearch} type={"plain"} className={"clear-button"}
                                    icon={<BsXLg className={"icon"}/>}/>}
                </div>
            </div>

            <div className={"chat-list__body"}>
                {searchInput.length > 0
                    ? <Loader isLoading={searchChatsStatus.isLoading || searchChatsStatus.isUninitialized}>
                        <div className={"search-results"}>
                            <div className={"chats"}>
                                {foundChats.chats.length === 0
                                    ? <span className={"search-results__header"}>No chats found.</span>
                                    : <>
                                        <span className={"search-results__header"}>Found chats:</span>
                                        <div className={"search-results__body"}>
                                            {foundChats.chats.map((chat) => <ChatItem key={chat.id} chat={chat}/>)}
                                        </div>
                                    </>
                                }
                            </div>

                            <div className="divider"></div>

                            <div className={"users"}>
                                {foundChats.users.length === 0
                                    ? <span className={"search-results__header"}>No users found.</span>
                                    : <>
                                        <span className={"search-results__header"}>Found users:</span>
                                        <div className={"search-results__body"}>
                                            {foundChats.users.map((user) => <UserItem key={user.id} user={user}/>)}
                                        </div>
                                    </>
                                }
                            </div>
                        </div>
                    </Loader>

                    : chats.length === 0
                        ? <span className={"chat-list__empty"}>There are no joined chats yet.</span>
                        : joinedChatsNode
                }
            </div>
        </div>
    )
}

export default ChatList;