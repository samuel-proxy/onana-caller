const { v4: uuidv4 } = require('uuid');

const calls = new Map();

function createCall(caller, receiver) {
    const callId = uuidv4();
    calls.set(callId, { 
        callId,
        caller, 
        receiver, 
        status: 'ringing'
    });
    return calls.get(callId);
}

function endCall(callId) {
    calls.delete(callId);
}

module.exports = { createCall, endCall };
