export enum ChatType {
    DIALOGUE = "DIALOGUE",
    GROUP = "GROUP"
}

export default interface IChatModel {
    id: number;
    name: string | null;
    type: ChatType;
    ownerId: number;
    isBanned: boolean;
    members: {id: number}[];
    messages: number[];
    avatar?: { data: string, isLoading: boolean };
    createdAt: string;
    updatedAt: string;
}