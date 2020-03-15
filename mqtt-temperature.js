var mqtt = require('mqtt');
const ACCESS_TOKEN = "OudVZKzcS8B11X7OmQJx";

// const ACCESS_TOKEN = process.argv[2];
const ServerHost = "192.119.116.101";
var client = mqtt.connect('mqtt://' + ServerHost, {
    username: ACCESS_TOKEN
});

var controlValue,
    realValue = 25;

client.on('connect', function () {
    console.log('connected');
    client.subscribe('v1/devices/me/rpc/request/+');
    console.log('Uploading temperature data once per second...');
    setInterval(publishTelemetry, 30000);
});

client.on('message', function (topic, message) {
    console.log('request.topic: ' + topic);
    console.log('request.body: ' + message.toString());
    var requestId = topic.slice('v1/devices/me/rpc/request/'.length),
        messageData = JSON.parse(message.toString());
    if (messageData.method === 'getValue') {
        if (controlValue === undefined) {
            client.publish('v1/devices/me/rpc/response/' + requestId, JSON.stringify(realValue));
        } else {
            client.publish('v1/devices/me/rpc/response/' + requestId, JSON.stringify(controlValue));
        }
    } else if (messageData.method === 'setValue') {
        controlValue = messageData.params;
        console.log('Going to set new control value: ' + controlValue);
    } else {
        client.publish('v1/devices/me/rpc/response/' + requestId, message);
    }
});

function publishTelemetry() {
    emulateTemperatureChanging();
    console.log("Uploading energy data once per minute..."+ realValue);
    client.publish('v1/devices/me/telemetry', JSON.stringify({temperature: realValue}));
}

function emulateTemperatureChanging() {
    if (controlValue !== undefined) {
        if (controlValue >= realValue) {
            realValue += (Math.random() + (Math.abs(controlValue - realValue) / 30));
        } else {
            realValue -= (Math.random() + (Math.abs(controlValue - realValue) / 30));
        }
    }
}
