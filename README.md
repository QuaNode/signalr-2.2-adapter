JavaScript and TypeScript clients for SignalR 2 for ASP.NET 4

### Example (Browser)

```javascript
let connection = new signalR.HubConnectionBuilder()
    .withUrl("/chat")
    .build();

connection.on("send", data => {
    console.log(data);
});

connection.start()
    .then(() => connection.invoke("send", "Hello"));
```

### Example (WebWorker)

```javascript
importScripts('signalr.js');

let connection = new signalR.HubConnectionBuilder()
    .withUrl("https://example.com/signalr/chat")
    .build();

connection.on("send", data => {
    console.log(data);
});

connection.start()
    .then(() => connection.invoke("send", "Hello"));

```

### Example (NodeJS)

```javascript
const signalR = require("@microsoft/signalr");

let connection = new signalR.HubConnectionBuilder()
    .withUrl("/chat")
    .build();

connection.on("send", data => {
    console.log(data);
});

connection.start()
    .then(() => connection.invoke("send", "Hello"));
```
