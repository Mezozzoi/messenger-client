import IAttachmentModel from "./attachment";

export default interface IMessageModel {
    id: number;
    content?: string;
    attachments: IAttachmentModel[];
    owner: {
        id: number,
        firstname: string,
        lastname: string
    };
    ownerId?: number;
    chatId: number;
    createdAt: string;
    updatedAt: string;
}