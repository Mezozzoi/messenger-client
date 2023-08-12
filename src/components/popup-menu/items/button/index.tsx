import {FC, ReactNode, useState} from "react";
import "./index.scss";

type MenuButtonProps =  {
    title: string,
    onClick: () => void,
    type?: "default" | "danger",
    icon?: ReactNode
}

const MenuButton: FC<MenuButtonProps> = ({title, onClick, type = "default", icon}) => {
    return (
        <div className={`menu-button ${type}`} onClick={onClick}>
            {icon && <div className={"icon"}>{icon}</div>}
            <span className={"title"}>{title}</span>
        </div>
    );
}

export default MenuButton;