# This Program illustrates the Simple Server Side RPC on ThingsBoard IoT Platform
# Paste your ThingsBoard IoT Platform IP and Device access token
# RPC Server_Side_RPC.py : This Program will illustrates the Server side RPC
import os
import time
import sys
import json
import random
import paho.mqtt.client as mqtt

# Thingsboard platform credentials
THINGSBOARD_HOST = '192.119.116.101'
ACCESS_TOKEN = 'OudVZKzcS8B11X7OmQJx'
button_state = {"enabled": False}

def setValue (params):
    button_state['enabled'] = params
    print("Rx setValue is : ",button_state)

# MQTT on_connect callback function
def on_connect(client, userdata, flags, rc):
    print("rc code:",rc)
    client.subscribe('v1/devices/me/rpc/request/+')
    
# MQTT on_message caallback function
def on_message(client, userdata, msg):
    print('Topic: ' + msg.topic + '\nMessage: ' + str(msg.payload))
    if msg.topic.startswith('v1/devices/me/rpc/request/'):
        requestId = msg.topic[len('v1/devices/me/rpc/request/'):len(msg.topic)]
        print("requestId : ",requestId)
        data = json.loads(msg.payload)
        if data['method'] == 'getValue':
            print("getvalue request\n")
            print("sent getValue : ",button_state)
            client.publish('v1/devices/me/rpc/response/'+requestId, json.dumps(button_state), 1)
        if data['method'] == 'setValue':
            print("setvalue request\n")
            params = data['params']
            setValue(params)
            client.publish('v1/devices/me/attributes', json.dumps(button_state), 1)

# start the client instance
client = mqtt.Client()

# registering the callbacks
client.on_connect = on_connect
client.on_message = on_message

client.username_pw_set(ACCESS_TOKEN)
client.connect(THINGSBOARD_HOST,1883,60)

try:
    client.loop_forever()

except KeyboardInterrupt:
    client.disconnect()