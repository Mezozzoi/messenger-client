import {createApi} from "@reduxjs/toolkit/dist/query/react";
import {IUserModel} from "../models/user";
import fetchBaseQueryWithReauth from "../redux/baseQueryWithReauth";

export type ChangePassword = {
    oldPassword: string,
    newPassword: string
}

export type EditProfile = {
    firstname?: string,
    lastname?: string,
    avatar?: FileList
}

const usersApi = createApi({
    reducerPath: "usersApi",
    baseQuery: fetchBaseQueryWithReauth("/users"),
    endpoints: (builder) => ({
        changePassword: builder.mutation<void, ChangePassword>({
            query: (args) => ({
                url: "/password/change",
                method: "POST",
                body: args
            })
        }),
        getUser: builder.mutation<IUserModel, number>({
            query: (args) => ({
                url: `/${args}`,
                method: "GET"
            })
        }),
        getAvatar: builder.mutation<string, number>({
            query: (args) => ({
                url: `/avatar/${args}`,
                method: "GET",
                responseHandler: (async (response) => {
                    const blob = await response.blob();
                    return blob.size === 0 ? "" : URL.createObjectURL(blob)
                }),
                cache: "no-cache"
            })
        }),
        editProfile: builder.mutation<IUserModel, EditProfile>({
            query: (args) => {
                const form = new FormData();

                args.avatar && form.append("avatar", Array.from(args.avatar)[0]);
                args.firstname && form.append("firstname", args.firstname);
                args.lastname && form.append("lastname", args.lastname);

                return {
                    url: "/profile/edit",
                    method: "POST",
                    body: form,
                    cache: "no-cache"
                }
            }
        })
    })
})

export const {useChangePasswordMutation, useGetUserMutation, useGetAvatarMutation, useEditProfileMutation} = usersApi;

export default usersApi;