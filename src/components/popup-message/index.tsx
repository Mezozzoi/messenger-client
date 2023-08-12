import React, {useState} from "react";
import {BsEmojiFrown, BsExclamationTriangle, BsInfoCircle, BsXLg} from "react-icons/bs";
import Button from "../button";
import "./index.scss";

type PopupMessageProps = {
    title: string,
    message: string,
    icon?: "error" | "invalid" | "info",
    /** Callback that will fire after close animation ends */
    close: () => void
}

/**
 * Popup to display simple message.
 */
const PopupMessage: React.FC<PopupMessageProps> = ({title, message, icon, close }) => {
    const [isClosing, setClosing] = useState(false);

    let _icon = null;
    switch (icon) {
        case "error": _icon = <BsEmojiFrown size={70} className={"popup-message__icon"}/>; break;
        case "invalid": _icon = <BsExclamationTriangle size={70} className={"popup-message__icon"}/>; break;
        default: _icon = <BsInfoCircle string={70} className={"popup-message__icon"}/>; break;
    }

    const handleClose = () => {
        setClosing(true);
        setTimeout(close, 250);
    }

    return (
        <div className={`popup-container ${isClosing ? "close" : ""}`}
             onClick={(e) => e.target === e.currentTarget && handleClose()}>
            <div className={"popup-message"}>
                <div className={"popup-message__header"}>
                    <div className={"popup-message__close"} onClick={handleClose}>
                        <BsXLg/>
                    </div>
                </div>
                <div className={"popup-message__body"}>
                    {_icon}
                    <span className={"popup-message__title"}>{title}</span>
                    <p className={"popup-message__message"}>{message}</p>
                    <Button title={"OK"} onClickHandler={handleClose} />
                </div>
            </div>
        </div>
    );
}

export default PopupMessage;