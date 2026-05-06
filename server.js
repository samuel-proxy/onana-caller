const WebSocket = require("ws");
const { addUser, removeUser, getUser } = require("./users");
const { handleSignaling } = require("./signaling");

/* =========================
   RENDER COMPATIBLE PORT
========================= */
const PORT = process.env.PORT || 3000;

/* =========================
   WEBSOCKET SERVER
========================= */
const wss = new WebSocket.Server({ port: PORT });

console.log(`Voice signaling server running on port ${PORT}`);

/* =========================
   CONNECTION HANDLER
========================= */
wss.on("connection", (ws) => {
    
    ws.isAlive = true;
    ws.userId = null;

    /* -------------------------
       MESSAGE HANDLER
    ------------------------- */
    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);

            /* =========================
               USER REGISTRATION
            ========================= */
            if (data.type === "register") {
                ws.userId = data.userId;

                addUser(data.userId, ws);

                console.log(`User registered: ${data.userId}`);
                return;
            }

            /* =========================
               SIGNALING ROUTER
            ========================= */
            handleSignaling(ws, data, {
                getUser
            });

        } catch (err) {
            console.error("Invalid message:", err);
        }
    });

    /* =========================
       CLEANUP ON DISCONNECT
    ========================= */
    ws.on("close", () => {
        if (ws.userId) {
            removeUser(ws.userId);
            console.log(`User disconnected: ${ws.userId}`);
        }
    });

    /* =========================
       PING/PONG (Render stability)
    ========================= */
    ws.on("pong", () => {
        ws.isAlive = true;
    });
});

/* =========================
   HEARTBEAT (IMPORTANT FOR RENDER)
========================= */
setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
            if (ws.userId) removeUser(ws.userId);
            return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
    });
}, 30000);
