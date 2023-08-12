import {ButtonHTMLAttributes, EventHandler, FC, MouseEventHandler, ReactNode} from "react";
import "./index.scss";

export type IconButtonProps = {
    onClickHandler: EventHandler<any>,
    icon: ReactNode,
    type?: "filled" | "plain",
    className?: string,
    id?: string,
    buttonProps?: ButtonHTMLAttributes<HTMLButtonElement>
}

const IconButton: FC<IconButtonProps> = ({icon, onClickHandler, type = "filled", className = "", id = "", buttonProps}) => {
    return (
        <button {...buttonProps} className={`icon-button ${type} ${className}`} id={id} onClick={onClickHandler}>
            {icon ? icon : null}
        </button>
    )
}

export default IconButton