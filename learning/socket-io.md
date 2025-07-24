# Socket.io basics

- io() connects to the same origin the page loaded from.
- emit(event, data) sends and on(event, handler) listens.
- Rooms group sockets; joining a conversation room filters broadcasts.
- Ack callbacks return the server result to the sender.
- The chat page emits new-message, typing and read events.
