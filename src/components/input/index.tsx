import "./index.scss";
import {
    ForwardedRef,
    forwardRef,
    InputHTMLAttributes,
} from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
}

const Input = forwardRef((props: InputProps, ref: ForwardedRef<HTMLInputElement>) => {
    return (
        <input {...props} ref={ref} className={"input " + (props.className ? props.className : "")} />
    )
})

export default Input;