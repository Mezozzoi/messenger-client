import {ButtonHTMLAttributes, FC, MouseEventHandler, ReactElement} from "react";
import "./index.scss"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    title: string;
    styleColor?: "primary" | "secondary" | "danger";
    styleType?: "filled" | "plain",
    onClickHandler?: MouseEventHandler;
    icon?: ReactElement<HTMLElement>;
}

const Button: FC<ButtonProps> = ({title, icon, onClickHandler, styleColor = "primary", styleType = "filled", className, ...props}) => {
    return (
        <button {...props} className={`button ${styleColor} ${styleType} ${className}`} onClick={onClickHandler}>
            {icon ? <div className={"icon"}>{icon}</div> : null}
            <span className={"title"}>{title}</span>
        </button>
    )
}

export default Button;