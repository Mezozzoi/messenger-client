import {initializeApp, FirebaseApp} from "firebase/app";
import {getToken, getMessaging, onMessage, deleteToken, Messaging} from "firebase/messaging";
import fcmApi from "./fcm.api";
import store from "../redux/store";

const firebaseConfig = {
    apiKey: "AIzaSyD7rfl8WL9mGXYHgjWPDZn_h4hgiGN5qag",
    authDomain: "messenger-1e62f.firebaseapp.com",
    projectId: "messenger-1e62f",
    storageBucket: "messenger-1e62f.appspot.com",
    messagingSenderId: "884752884028",
    appId: "1:884752884028:web:e7445d7be23c2844ad7e39"
};

let app: FirebaseApp, messaging: Messaging, isFcmAvailable: boolean;

try {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    isFcmAvailable = true;
} catch {
    isFcmAvailable = false;
}

export async function requestNotification() {
    if (isFcmAvailable) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            const token = await getToken(messaging, {vapidKey: process.env["REACT_APP_FCM_VAPID"]});
            store.dispatch(fcmApi.endpoints.registerToken.initiate(token));
        }
    }
}

export async function removeNotification() {
    if (isFcmAvailable) {
        await deleteToken(messaging);
    }
}