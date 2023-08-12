
export interface IUserModel {
    id: number;
    email: string;
    role: string;
    firstname: string;
    lastname: string;
    isBaned: boolean;
    avatar?: { data: string, isLoading: boolean };
} 