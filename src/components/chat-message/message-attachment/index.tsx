import {FC, ReactElement, useEffect, useRef, useState} from "react";
import {useGetAttachmentMutation} from "../../../services/attachments.api";
import "./index.scss"
import IAttachmentModel from "../../../models/attachment";
import {BsFileEarmarkArrowDown, BsFileEarmarkCheck, BsImage} from "react-icons/bs";
import formatBytes from "../../../common/format-bytes";

type MessageAttachmentProps = IAttachmentModel & {
}

const MessageAttachment: FC<MessageAttachmentProps> = ({id, type, filename, size}) => {
    const [data, setData] = useState<string | undefined>(undefined);
    const [fetchData, fetchDataStatus] = useGetAttachmentMutation();
    const fileLinkRef = useRef<HTMLAnchorElement | null>(null);

    useEffect( () => {
        (async ()=> {
            if (["IMAGE", "VIDEO", "AUDIO"].includes(type)) {
                const data = await fetchData({id}).unwrap();
                setData(data);
            }
        })()
    }, [])

    const downloadFile = async () => {
        if (!data && fetchDataStatus.isUninitialized && !fetchDataStatus.isLoading) {
            const data = await fetchData({id}).unwrap();
            setData(data);
        } else {
            fileLinkRef.current?.click();
        }
    }

    let element: ReactElement | null = null;

    if (type === "IMAGE") {
        element = data
            ? <img className={"message-attachment__image"} alt={""} src={data}/>
            : <div className={"message-attachment__image"}><BsImage size={30}/></div>
    } else if (type === "FILE") {
        element =
            <div className={"message-attachment__file"} onClick={downloadFile}>
                {data && <a ref={fileLinkRef} href={data} download={filename} style={{display: "none"}}></a>}
                {data
                    ? <BsFileEarmarkCheck className={"file-icon"}/>
                    : <BsFileEarmarkArrowDown className={"file-icon"}/>}
                <div className={"file-details"}>
                    <span className={"filename"}>{filename}</span>
                    <span className={"file-size"}>{formatBytes(size, 1)}</span>
                </div>
            </div>
    } else if (type === "VIDEO") {
        element = <video controls={true} className={"message-attachment__video"} src={data}></video>
    } else if (type === "AUDIO") {
        element = <audio src={data} controls={true} className={"message-attachment__audio"}></audio>
    }

    return element;
}

export default MessageAttachment;