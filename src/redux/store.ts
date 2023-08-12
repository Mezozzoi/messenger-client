import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import authSlice from './reducers/authSlice';
import {ThunkMiddleware} from 'redux-thunk';
import messagesSlice from "./reducers/messagesSlice";
import chatsSlice from "./reducers/chatsSlice";
import authApi from '../services/auth.api';
import usersApi from "../services/users.api";
import chatsApi from "../services/chats.api";
import messagesApi from "../services/messages.api";
import attachmentsApi from "../services/attachments.api";
import usersSlice from "./reducers/usersSlice";
import debugApi from "../services/debug.api";
import fcmApi from "../services/fcm.api";


const rootReducer = combineReducers({
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [chatsApi.reducerPath]: chatsApi.reducer,
    [messagesApi.reducerPath]: messagesApi.reducer,
    [attachmentsApi.reducerPath]: attachmentsApi.reducer,
    [debugApi.reducerPath]: debugApi.reducer,
    [fcmApi.reducerPath]: fcmApi.reducer,
    authSlice,
    messagesSlice,
    chatsSlice,
    usersSlice
})

const middlewares = [
    authApi.middleware,
    usersApi.middleware,
    chatsApi.middleware,
    messagesApi.middleware,
    attachmentsApi.middleware,
    debugApi.middleware,
    fcmApi.middleware
] as Array<ThunkMiddleware>

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(middlewares)
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;