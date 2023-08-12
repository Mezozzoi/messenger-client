enum IAttachmentType {
    FILE = "FILE",
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
    AUDIO = "AUDIO"
}

export default interface IAttachmentModel {
    id: number,
    type: IAttachmentType,
    filename: string,
    size: number
}