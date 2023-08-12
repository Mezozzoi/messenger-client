import "./index.scss";
import {createElement, FC, FormEventHandler, ReactNode, ReactPortal, useState} from "react";
import Button from "../button";
import Input from "../input";
import {ImageInput} from "../image-input";
import {createPortal} from "react-dom";
import PopupMessage from "../popup-message";
import Loader from "../loader";

type FieldInput = {
    name: string,
    value: any
}

/**
 * Checks fields before fire action callback. If error is returned, creates popup message.
 * @param {FieldInput[]} fields Array of provided fields
 * @returns {string | undefined} Error message
 * */
type ValidateCallback = (fields: FieldInput[]) => Promise<string | undefined>;

/**
 * Fires with fields when button is clicked.
 * @param {FieldInput[]} fields Array of provided fields
 * @returns {string | undefined} Error message
 * */
type ActionCallback = (fields: FieldInput[]) => Promise<string | undefined>;

type PopupDialogProps = {
    title: string,
    description?: string,
    actions: {
        title: string,
        cb?: ActionCallback,
        validate?: ValidateCallback,
    }[],
    closeCb: (fields: FieldInput[]) => void,
    fields?: {
        title: string,
        name: string,
        type: "text" | "file" | "image" | "password",
        options?: {
            placeholder?: string,
            initialImage?: string,
        }
    }[]
}

/** Dialog popup with fields and actions */
const PopupDialog: FC<PopupDialogProps> = ({title, description, actions, fields, closeCb}) => {
    const [fieldsInput, setFieldsInput] = useState<FieldInput[]>([]);
    const [isClosing, setClosing] = useState(false);
    const [isActionLoading, setActionLoading] = useState<boolean>(false);
    const [portal, setPortal] = useState<ReactPortal | null>(null);

    const setField = (name: string, value: any) => {
        let clone = fieldsInput.slice();
        let field = clone.find(e => e.name === name);

        if (field)
            field.value = value
        else
            clone.push({name, value});

        setFieldsInput(clone);
    }

    const onInput: FormEventHandler<HTMLInputElement> = (e) => {
        if (e.currentTarget.type === "file") setField(e.currentTarget.name, e.currentTarget.files)
        else setField(e.currentTarget.name, e.currentTarget.value)
    }

    const onButtonClick = async (cb?: ActionCallback, validate?: ValidateCallback) => {
        if (validate) {
            const error = await validate(fieldsInput);
            if (error) {
                setPortal(createPortal(
                    <PopupMessage title={"Validation error."} message={error}
                                  icon={"invalid"} close={() => setPortal(null)}/>,
                    document.body
                ));
                return;
            }
        }

        if (cb) {
            setActionLoading(true);

            cb(fieldsInput).then(error => {
                setActionLoading(false);

                if (error) {
                    setPortal(createPortal(
                        <PopupMessage title={"Error has occurred."} message={error}
                                      icon={"error"} close={() => setPortal(null)}/>,
                        document.body
                    ));
                    return;
                }

                close();
            });
        } else {
            close();
        }
    }

    const close = () => {
        setClosing(true);
        setTimeout(() => closeCb(fieldsInput), 250);
    }

    return (
        <div className={`popup-container ${isClosing ? "closing" : ""}`}
             onClick={(e) => {if (e.currentTarget === e.target) close()}}>
            <div className={"popup-dialog"}>
                <div className={"popup-dialog__title"}>{title}</div>
                {description ? <div className={"popup-dialog__description"}>{description}</div> : null}
                {fields ? <div className={"popup-dialog__fields"}>
                    {fields.map((e, i) => {
                        let input: ReactNode = null;
                        let label = createElement("label", {}, e.title)

                        switch (e.type) {
                            case "image":
                                input = <ImageInput onInput={onInput} name={e.name} initialImage={e.options?.initialImage} disabled={isActionLoading}/>;
                                break;
                            case "file":
                                input = <Input onInput={onInput} name={e.name} type={"file"} disabled={isActionLoading}/>;
                                break;
                            case "text":
                                input = <Input onInput={onInput} name={e.name} placeholder={e.options?.placeholder || ""} type={"text"} disabled={isActionLoading}/>
                                break;
                            case "password":
                                input = <Input onInput={onInput} name={e.name} placeholder={e.options?.placeholder || ""} type={"password"} disabled={isActionLoading}/>
                                break;
                        }

                        return createElement("div", {className: "field", key: i}, label, input);
                    })}
                </div> : null}
                <div className={"popup-dialog__actions"}>
                    {actions.map((e, i) =>
                        <Button key={i} className={"popup-dialog__button"} title={e.title}
                                onClickHandler={() => onButtonClick(e.cb, e.validate)} disabled={isActionLoading}
                        />
                    )}
                </div>

                {portal}

                {isActionLoading && <Loader isSpread={true} absolute={true} dark={true}/>}
            </div>
        </div>
    )
}

export default PopupDialog;