import {io} from "socket.io-client";

const socketUrl = new URL(process.env["REACT_APP_SOCKET_URL"] || "http://localhost:5000");

const socket = io(socketUrl.origin, {
    path: socketUrl.pathname,
    transports: ['websocket', 'polling', 'flashsocket'],
    autoConnect: false
});

export default socket;