var mqtt = require('mqtt');
const ACCESS_TOKEN = process.argv[2];

var client  = mqtt.connect('mqtt://demo.thingsboard.io',{
    username: ACCESS_TOKEN
});

var energyData = {
    energyIncrement: Math.random(),
    energy: 19546
}

client.on('connect', function () {
    console.log('connected');
    console.log('Uploading energy data once per minute...');
    setInterval(publishTelemetry, 60000);
});

function publishTelemetry() {
    energyData.energyIncrement = Math.random();
    energyData.energy += energyData.energyIncrement;
    client.publish('v1/devices/me/telemetry', JSON.stringify(energyData));
}
