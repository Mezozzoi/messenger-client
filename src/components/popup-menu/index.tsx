import {FC, MouseEventHandler, ReactNode, useState} from "react";
import "./index.scss";
import {BsXLg} from "react-icons/bs";

type PopupMenuProps = {
    className?: string,
    id?: string,
    title: string,
    children: ReactNode[] | ReactNode,
    close: () => void
}

/** Popup with options */
const PopupMenu: FC<PopupMenuProps> = ({title, children, close, className, id}) => {
    const [isClosing, setClosing] = useState(false);

    const closeMenu: MouseEventHandler = (e) => {
        e.stopPropagation();
        setClosing(true);
        setTimeout(() => close(), 250);
    }

    return (
        <div className={`popup-container ${className ? className : ""} ${isClosing ? "close" : ""}`} id={id && id} onClick={
            (e) => {e.target === e.currentTarget && closeMenu(e)}}>
            <div className={"popup-menu"}>
                <div className={"popup-menu__header"}>
                    <div className={"popup-menu__title"}>{title}</div>
                    <button onClick={closeMenu} title={"Close"}><BsXLg/></button>
                </div>

                <div className={"popup-menu__body"}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default PopupMenu;