
// Requires node.js and mqtt library installed.
var mqtt = require('mqtt');
var os = require("os");

const thingsboardHost = "106.12.216.163";
// Reads the access token from arguments
const accessToken = "BXPVzyZm4R5IN0WJjcz4";
// const accessToken = process.argv[2];

// Default topics. See http://thingsboard.io/docs/reference/mqtt-api/ for more details.
const attributesTopic = 'v1/devices/me/attributes';
const telemetryTopic = 'v1/devices/me/telemetry';
const attributesRequestTopic = 'v1/devices/me/attributes/request/1';
const attributesResponseTopic = attributesRequestTopic.replace('request', 'response');

// Initialization of mqtt client using Thingsboard host and device access token
console.log('Connecting to: %s using access token: %s', thingsboardHost, accessToken);
var client = mqtt.connect('mqtt://' + thingsboardHost, {username: accessToken});

var firmwareVersion = '1.0.1';
var appState;
// Telemetry upload is once per 5 seconds by default;
var currentFrequency = 5;
var uploadInterval;

// Triggers when client is successfully connected to the Thingsboard server
client.on('connect', function () {
    console.log('Client connected!');

    // Upload firmware version and serial number as device attribute using 'v1/devices/me/attributes' MQTT topic
    client.publish(attributesTopic, JSON.stringify({
        'firmwareVersion': '1.0.1',
        'serialNumber': 'SN-' + random()
    }));
    // Subscribe to shared attribute changes on the server side
    client.subscribe(attributesTopic);
    // Publish request for 'appState' client attribute
    // and two shared attributes 'uploadFrequency' and 'latestVersion'
    client.publish(attributesRequestTopic, JSON.stringify({
        'clientKeys': 'appState',
        'sharedKeys': 'uploadFrequency,latestFirmwareVersion'
    }));

    // Schedule OS stats upload
    console.log('Uploading OS stats with interval %s (sec)...', currentFrequency);
    uploadInterval = setInterval(uploadStats, currentFrequency * 1000);
});

client.on('message', function (topic, message) {
    if (topic === attributesTopic) {
        // Process attributes update notification
        console.log('Received attribute update notification: %s', message.toString());
        var data = JSON.parse(message);
        if (data.uploadFrequency && data.uploadFrequency != currentFrequency) {
            // Reschedule upload using new frequency
            rescheduleStatsUpload(data.uploadFrequency);
        }
        if (data.latestFirmwareVersion && data.latestFirmwareVersion != firmwareVersion) {
            // Received new upload frequency configuration
            console.log('New firmware version is available: %s', data.latestFirmwareVersion);
        }
    } else if (topic === attributesResponseTopic) {
        // Process response to attributes request
        console.log('Received response to attribute request: %s', message.toString());
        var data = JSON.parse(message);
        if (data.client && data.client.appState) {
            appState = data.client.appState;
            console.log('Restore app state to: %s', appState);
        } else {
            appState = random();
            console.log('This is first application launch. Going to publish random application state: %s', appState);
            client.publish(attributesTopic, JSON.stringify({'appState': appState}));
        }
        if (data.shared) {
            if (data.shared.uploadFrequency && data.shared.uploadFrequency != currentFrequency) {
                // Received new upload frequency configuration
                rescheduleStatsUpload(data.shared.uploadFrequency);
            }
            if (data.shared.latestFirmwareVersion && data.shared.latestFirmwareVersion != firmwareVersion) {
                // Received new upload frequency configuration
                console.log('New firmware version is available: %s', data.shared.latestFirmwareVersion);
            }
        }
    }
})

// Reschedule of stats upload timer
function rescheduleStatsUpload(uploadFrequency) {
    clearInterval(uploadInterval);
    currentFrequency = uploadFrequency;
    console.log('Uploading OS stats with new interval %s (sec)...', currentFrequency);
    uploadInterval = setInterval(uploadStats, currentFrequency * 1000);
}

// Upload OS stats using 'v1/devices/me/telemetry' MQTT topic
function uploadStats() {
    var data = {};
    data.type = os.type();
    data.uptime = os.uptime();
    data.mem = os.freemem() / os.totalmem();
    // console.log('Publishing OS info & stats: %s', JSON.stringify(data));
    client.publish(telemetryTopic, JSON.stringify(data));
}

function random() {
    return Math.floor(Math.random() * 1000);
}

// Catches ctrl+c event
process.on('SIGINT', function () {
    console.log();
    console.log('Disconnecting...');
    client.end();
    console.log('Exited!');
    process.exit(2);
});

// Catches uncaught exceptions
process.on('uncaughtException', function (e) {
    console.log('Uncaught Exception...');
    console.log(e.stack);
    process.exit(99);
});