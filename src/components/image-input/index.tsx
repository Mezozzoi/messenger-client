import {FC, FormEventHandler, useRef, useState} from "react";
import Button from "../button";
import "./index.scss";

export type ImageInputProps = {
    onInput: FormEventHandler<HTMLInputElement>,
    name: string,
    initialImage?: string,
    className?: string,
    disabled?: boolean
}

export const ImageInput: FC<ImageInputProps> = ({onInput, name, className, initialImage, disabled}) => {
    const [image, setImage] = useState<string | undefined>(initialImage);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const _onInput: FormEventHandler<HTMLInputElement> = (e) => {
        if (inputRef.current?.files) setImage(URL.createObjectURL(inputRef.current?.files[0]));
        else setImage(initialImage);
        onInput(e);
    }

    return (
        <div className={`image-input-container ${className ? className : ""}`}>
            {image ? <img className={"preview"} src={image}/> : <div className={"preview"}></div>}
            <input className={"input image-input"} onInput={_onInput} ref={inputRef} name={name} multiple={false} hidden={true} accept={".webp, .jpeg, .jpg, .png"} type={"file"} disabled={disabled}/>
            <Button title={"Change avatar"} className={"select-image"} styleColor={"secondary"} onClickHandler={() => inputRef.current?.click()} disabled={disabled}/>
        </div>
    );
}