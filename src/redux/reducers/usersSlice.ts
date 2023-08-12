import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import usersApi from "../../services/users.api";
import {IUserModel} from "../../models/user";
import {RootState} from "../store";

export const getAvatar = (userId: number) => (state: RootState) =>
    state.usersSlice.users.find(e => e.id === userId)?.avatar?.data;

export const isAvatarLoading = (userId: number) => (state: RootState) => {
    return Boolean(state.usersSlice.users.find(e => e.id === userId)?.avatar?.isLoading);
}

type InitialState = {
    users: Pick<IUserModel, "id" | "avatar">[];
}

const initialState: InitialState = {
    users: []
}

const usersSlice = createSlice({
    name: "avatars",
    initialState,
    reducers: {
        updateUser: (state, action: PayloadAction<IUserModel>) => {
            const userIndex = state.users.findIndex(e => e.id === action.payload.id);
            if (userIndex >= 0) state.users[userIndex] = Object.assign({}, state.users[userIndex], action.payload);
        }
    },
    extraReducers: builder => {
        builder
            .addMatcher(usersApi.endpoints.getAvatar.matchPending, (state, action) => {
                const user = state.users.find(e => e.id === action.meta.arg.originalArgs);

                if (!user) {
                    state.users.push({id: action.meta.arg.originalArgs, avatar: {data: "", isLoading: true}});
                } else {
                    if (!user!.avatar) user!.avatar = {data: "", isLoading: true};
                    else user!.avatar.isLoading = true;
                }
            })
            .addMatcher(usersApi.endpoints.getAvatar.matchFulfilled, (state, action) => {
                const user = state.users.find(e => e.id === action.meta.arg.originalArgs)!;
                user.avatar!.data = action.payload;
                user.avatar!.isLoading = false;
            })
            .addMatcher(usersApi.endpoints.getAvatar.matchRejected, (state, action) => {
                state.users.splice(state.users.findIndex(e => e.id === action.meta.arg.originalArgs), 1);
            })
    }
})

export const {updateUser} = usersSlice.actions;

export default usersSlice.reducer;