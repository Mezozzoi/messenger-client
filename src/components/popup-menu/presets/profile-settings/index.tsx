import {FC, ReactPortal, useEffect, useState} from "react";
import PopupMenu from "../../index";
import "./index.scss";
import MenuButton from "../../items/button";
import PopupDialog from "../../../popup-dialog";
import {useChangePasswordMutation, useEditProfileMutation, useGetAvatarMutation} from "../../../../services/users.api";
import {useTypedSelector} from "../../../../redux/store";
import {getUser} from "../../../../redux/reducers/authSlice";
import {useSendExceptionMutation} from "../../../../services/debug.api";
import HttpError from "../../../../common/http-error";
import MenuDivider from "../../items/divider";
import UserAvatar from "../../../user-avatar";
import {getAvatar, isAvatarLoading} from "../../../../redux/reducers/usersSlice";
import {createPortal} from "react-dom";

type ProfileSettingsProps = {
    close: () => void
}

const ProfileSettings: FC<ProfileSettingsProps> = ({close}) => {
    const [portal, setPortal] = useState<ReactPortal | null>(null);
    const [editProfile, editProfileStatus] = useEditProfileMutation();
    const [changePassword, changePasswordStatus] = useChangePasswordMutation();
    const [fetchAvatar, fetchAvatarStatus] = useGetAvatarMutation();
    const user = useTypedSelector(getUser)!;
    const avatar = useTypedSelector(getAvatar(user.id));
    const _isAvatarLoading = useTypedSelector(isAvatarLoading(user.id));
    const [sendException] = useSendExceptionMutation();

    useEffect(() => {
        !_isAvatarLoading && !avatar && fetchAvatar(user!.id);
    }, []);

    const onEditProfile = () => {
        setPortal(createPortal(<PopupDialog
            title={"Edit profile"}
            fields={[
                {title: "Avatar", type: "image", name: "avatar", options: {initialImage: avatar}},
                {title: "Firstname", type: "text", name: "firstname"},
                {title: "Lastname", type: "text", name: "lastname"},
            ]}
            actions={[
                {
                    title: "Confirm",
                    cb: async fields => {
                        try {
                            !editProfileStatus.isLoading && await editProfile({
                                firstname: fields.find(e => e.name === "firstname")?.value,
                                lastname: fields.find(e => e.name === "lastname")?.value,
                                avatar: fields.find(e => e.name === "avatar")?.value,
                            }).unwrap();
                        } catch (e) {
                            sendException(e);
                            return "Error while trying to change profile.";
                        }

                        fields.find(e => e.name === "avatar") && fetchAvatar(user!.id);

                        return undefined;
                    },
                    validate: async fields => {
                        const firstname: string = fields.find(e => e.name === "firstname")?.value;
                        const lastname: string = fields.find(e => e.name === "lastname")?.value;

                        if (firstname && (firstname.length < 3 || firstname.length > 20))
                            return "Firstname must be 3-20 symbols";
                        if (lastname && (lastname.length < 3 || lastname.length > 20))
                            return "Lastname must be 3-20 symbols";

                        return undefined;
                    }
                },
                {title: "Cancel"}
            ]} closeCb={() => setPortal(null)}/>, document.body));
    }

    const onChangePassword = () => {
        setPortal(createPortal(<PopupDialog
            title={"Change password"}
            fields={[
                {
                    title: "Current password",
                    type: "password",
                    name: "currentPassword",
                    options: {placeholder: "Current password"}
                },
                {title: "New password", type: "password", name: "newPassword", options: {placeholder: "New password"}},
                {
                    title: "Repeat new password",
                    type: "password",
                    name: "repeatNewPassword",
                    options: {placeholder: "Repeat new password"}
                },
            ]}
            actions={[
                {
                    title: "Confirm",
                    cb: async fields => {
                        try {
                            !changePasswordStatus.isLoading && await changePassword({
                                oldPassword: fields.find(e => e.name === "currentPassword")?.value,
                                newPassword: fields.find(e => e.name === "newPassword")?.value,
                            }).unwrap();
                        } catch (e) {
                            sendException(e);
                            console.error(e);
                            if ((e as HttpError).status === 400) return "Invalid current or new password.";
                            return "Error while trying to change password.";
                        }

                        return undefined;
                    },
                    validate: async (fields) => {
                        const currentPassword: string = fields.find(e => e.name === "currentPassword")?.value;
                        const newPassword: string = fields.find(e => e.name === "newPassword")?.value;
                        const repeatNewPassword: string = fields.find(e => e.name === "repeatNewPassword")?.value;

                        if (!currentPassword || currentPassword.length <= 0)
                            return "Enter current password";
                        if (!newPassword || newPassword.length < 8 || newPassword.length > 32)
                            return "New password must be 8-32 symbols";
                        if (newPassword && repeatNewPassword && newPassword !== repeatNewPassword)
                            return "New password does not match.";

                        return undefined;
                    }
                },
                {title: "Cancel"}
            ]} closeCb={() => setPortal(null)}/>, document.body));
    }

    return (
        <PopupMenu title={"Profile settings"} className={"profile-settings"} close={close}>
            {portal}

            <div className={"profile-info"}>
                <UserAvatar userId={user.id}/>

                <div className={"profile-details"}>
                    <span className={"profile-name"}>{user.firstname + " " + user.lastname}</span>
                    <span className={"profile-id"}>{user.id}</span>
                </div>
            </div>

            <MenuDivider/>
            <MenuButton title={"Edit profile"} onClick={onEditProfile}/>
            <MenuButton title={"Change password"} onClick={onChangePassword}/>
        </PopupMenu>
    )
}

export default ProfileSettings;