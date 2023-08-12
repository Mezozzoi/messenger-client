import "./index.scss";
import {FC, ReactNode, useEffect, useLayoutEffect, useRef, useState} from "react";

export type ContextMenuProps = {
    position: {
        left: number,
        top: number
    },
    fields: {
        icon?: ReactNode,
        type?: "default" | "accent" | "danger" | string,
        title: string,
        cb: () => void
    }[],
    close: () => void
}

const ContextMenu: FC<ContextMenuProps> = ({position, fields, close}) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [_position, setPosition] = useState<{left: number, top: number}>({top: position.top, left: position.left});

    useLayoutEffect(() => {
        setPosition({
            left: Math.min(position.left, document.body.clientWidth - ref.current!.clientWidth),
            top: Math.min(position.top, document.body.clientHeight - ref.current!.clientHeight)
        })
    }, [])

    const onClick = (cb: () => void) => {
        cb();
        close();
    }

    return (
        <div className={"context-menu-container"} onClick={close}>
            <div className={"context-menu"} style={{left: `${_position.left}px`, top: `${_position.top}px`}} ref={ref}>
                {fields.map((field, index) =>
                    <div className={`context-menu__action ${field.type || "default"}`} key={index} onClick={() => onClick(field.cb)}>
                        {field.icon && <div className={"context-menu__action-icon"}>{field.icon}</div>}
                        <span className={"context-menu__action-title"}>{field.title}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ContextMenu;