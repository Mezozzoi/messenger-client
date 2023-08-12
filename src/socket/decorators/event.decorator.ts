import socket from "../socket";

export default function Event(name: string) {
    return (target: any, methodKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
        socket.on(name, (message) => {
            if (process.env.NODE_ENV === "development") {
                console.log(`[${new Date().toLocaleTimeString()}] Event '${name}' has been received.`);
            }
            descriptor.value?.call(target, message);
        });
    }
}