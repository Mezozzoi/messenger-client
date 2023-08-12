import React, {ChangeEventHandler, FC, FormEventHandler, ReactPortal, useEffect, useRef, useState} from "react";
import Input from "../../input";
import IconButton from "../../icon-button";
import {IoSend} from "react-icons/io5";
import {useAppDispatch, useTypedSelector} from "../../../redux/store";
import "./index.scss";
import {getCurrentChat} from "../../../redux/reducers/chatsSlice";
import {useEditMessageMutation, useSendMessageMutation} from "../../../services/messages.api";
import {BsCheckLg, BsPaperclip, BsX} from "react-icons/bs";
import {useSendExceptionMutation} from "../../../services/debug.api";
import {getEditingMessage, setEditingMessage} from "../../../redux/reducers/messagesSlice";
import {createPortal} from "react-dom";
import PopupMessage from "../../popup-message";

const ChatInput: FC = () => {
    const dispatch = useAppDispatch();
    const [inputMessage, setInputMessage] = useState("");
    const [isSending, setSending] = useState(false);
    const chat = useTypedSelector(getCurrentChat);
    const [sendMessage] = useSendMessageMutation();
    const attachmentsInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [sendException] = useSendExceptionMutation();
    const editingMessage = useTypedSelector(getEditingMessage);
    const [editMessage, editMessageStatus] = useEditMessageMutation();
    const [portal, setPortal] = useState<ReactPortal | null>(null);

    useEffect(() => {
        if (editingMessage) {
            setInputMessage(editingMessage.content || "");
            removeFiles();
        }
    }, [editingMessage]);

    const handleMessageInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setInputMessage(e.target.value);
    }

    const handleSendMessage = () => {
        if (!inputMessage && files.length === 0) return;
        setSending(true);

        (async () => {
            try {
                await sendMessage({
                    chatId: chat!.id,
                    content: inputMessage,
                    attachments: attachmentsInputRef.current!.files!
                }).unwrap();
                setInputMessage("");
                removeFiles();
            } catch (e) {
                sendException(e);
                setPortal(createPortal(
                    <PopupMessage title={"Could not send message"} message={"Something bad happened."}
                                  close={() => setPortal(null)} icon={"error"}/>,
                    document.body))
            } finally {
                setSending(false);
                inputRef.current!.focus();
            }
        })();
    }

    const handleClip: FormEventHandler<HTMLInputElement> = (e) => {
        attachmentsInputRef.current!.click();
        inputRef.current!.focus();
    }

    const handleFiles: FormEventHandler<HTMLInputElement> = (e) => {
        setFiles(Array.from(e.currentTarget.files || []));
    }

    const removeFiles = () => {
        attachmentsInputRef.current!.value = "";
        setFiles([]);
    }

    const handleEditMessage = async () => {
        setSending(true);
        !editMessageStatus.isLoading &&
        editMessage({
            id: editingMessage!.id,
            content: inputMessage,
            attachments: attachmentsInputRef.current!.files || undefined
        }).then(() => {
            setSending(false);
            setInputMessage("");
            inputRef.current!.focus();
            dispatch(setEditingMessage(null));
        });
    }

    const closeEditing = () => {
        setInputMessage("");
        removeFiles();
        dispatch(setEditingMessage(null));
    }

    return (
        <div id={"chat-view__footer"}>
            {editingMessage &&
                <div className={"chat-view__editing"}>
                    <span className={"chat-view__editing-label"}>Editing message</span>
                    <IconButton onClickHandler={closeEditing} icon={<BsX className={"icon"}/>}
                                type={"plain"} className={"chat-view__editing-close"}/>
                </div>}

            {files.length > 0 ? <div id={"chat-view__attachments-hint"}>
                {files[0].type.includes("image") &&
                    <img className={"file-preview"} src={URL.createObjectURL(files[0])} alt=""/>}
                <span className={"filename"}>{files[0].name}</span>
                {files.length > 1 ? <span className={"files-count"}>and {files.length - 1} more</span> : null}
                <IconButton className={"remove-files"} onClickHandler={removeFiles} type={"plain"} icon={<BsX/>}/>
            </div> : null}

            <div id={"chat-view__input-container"}>
                <Input id={"chat-view__input"} ref={inputRef}
                       onKeyDown={(e) => e.key === "Enter" &&
                           ((editingMessage && handleEditMessage()) ||
                               handleSendMessage())}
                       onChange={handleMessageInputChange} placeholder={"Enter message"}
                       value={inputMessage} readOnly={isSending} autoComplete={"off"} name={"chat-view__input"}/>

                <input hidden id={"attachments"} ref={attachmentsInputRef} type={"file"} onInput={handleFiles}
                       multiple={true}/>

                <IconButton onClickHandler={handleClip} icon={<BsPaperclip/>} id={"chat-view__clip-button"}/>
                {editingMessage
                    ? <IconButton onClickHandler={handleEditMessage} icon={<BsCheckLg fill={"white"}/>}
                                  id={"chat-view__send-button"} buttonProps={{disabled: isSending}}/>
                    : <IconButton onClickHandler={handleSendMessage} icon={<IoSend fill={"white"}/>}
                                  id={"chat-view__send-button"} buttonProps={{disabled: isSending}}/>}
            </div>

            {portal}
        </div>
    )
}

export default ChatInput;