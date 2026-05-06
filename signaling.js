const { getUser } = require('./users');
const { createCall } = require('./callmanager');

function handleSignaling(ws, data){
    switch(data.type){
        case "register":
            // Handle user registration
            ws.userId = data.userId;
            console.log(`User registered: ${data.userId}`);
            break;
        case "call_user":
            // Handle call initiation
            const call = createCall(data.from, data.to);
            const target = getUser(data.to);
            if(target){
                target.send(JSON.stringify({ 
                    type: "incoming_call", 
                    from: data.from,
                    callId: call.callId
                     
                }));
            }
            break;
        case "accept_call": {
            // Handle call acceptance
            const target = getUser(data.to);
            if(target){
                target.send(JSON.stringify({ 
                    type: "call_accepted", 
                    from: data.from,
                }));
            }
        }
        break;

        case "webrtc_offer": 
        case "webrtc_answer":
        case "ice_candidate": 
        case "end_call": {
            // Handle WebRTC signaling and call termination
            const target = getUser(data.to);
            if(target){
                target.send(JSON.stringify(data));
            }
            break;
        }
    }
}

module.exports = { handleSignaling };
