# This Program illustrates the Server Side RPC on ThingsBoard IoT Platform
# Paste your ThingsBoard IoT Platform IP and Device access token
# Temperature_Controller_Server_Side_RPC.py : This program illustrates Server side RPC using a Simulated Temperature Controller
import os
import time
import sys
import json
import random
import paho.mqtt.client as mqtt
from threading import Thread

# Thingsboard platform credentials
THINGSBOARD_HOST = '192.119.116.101'       #Change IP Address
ACCESS_TOKEN = 'OudVZKzcS8B11X7OmQJx'
sensor_data = {'temperature': 25}

def publishValue(client):
    INTERVAL = 2
    print("Thread  Started")
    next_reading = time.time()
    while True:
        client.publish('v1/devices/me/telemetry', json.dumps(sensor_data),1)
        next_reading += INTERVAL
        sleep_time = next_reading - time.time()
        if sleep_time > 0:
            time.sleep(sleep_time)

def read_temperature():
    temp = sensor_data['temperature']
    return temp

# Function will set the temperature value in device
def setValue (params):
    sensor_data['temperature'] = params
    #print("Rx setValue is : ",sensor_data)
    print("Temperature Set : ",params,"C")

# MQTT on_connect callback function
def on_connect(client, userdata, flags, rc):
    #print("rc code:", rc)
    client.subscribe('v1/devices/me/rpc/request/+')

# MQTT on_message callback function
def on_message(client, userdata, msg):
    #print('Topic: ' + msg.topic + '\nMessage: ' + str(msg.payload))
    if msg.topic.startswith('v1/devices/me/rpc/request/'):
        requestId = msg.topic[len('v1/devices/me/rpc/request/'):len(msg.topic)]
        #print("requestId : ", requestId)
        data = json.loads(msg.payload)
        if data['method'] == 'getValue':
            #print("getvalue request\n")
            #print("sent getValue : ", sensor_data)
            client.publish('v1/devices/me/rpc/response/' + requestId, json.dumps(sensor_data['temperature']), 1)
        if data['method'] == 'setValue':
            #print("setvalue request\n")
            params = data['params']
            setValue(params)

# create a client instance
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.username_pw_set(ACCESS_TOKEN)
client.connect(THINGSBOARD_HOST,1883,60)

t = Thread(target=publishValue, args=(client,))


try:
    client.loop_start()
    t.start()
    while True:
        pass

except KeyboardInterrupt:
    client.disconnect()