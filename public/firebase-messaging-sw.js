/* eslint-disable no-restricted-globals */
self.addEventListener("push", e => {
    const payload = e.data.json();

    e.waitUntil(
        self.registration.showNotification(payload.data.title, {body: payload.data.content})
    );
})