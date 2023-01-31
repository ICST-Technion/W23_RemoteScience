#from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
import subprocess
#import signal
import json
import time
#import sys
#import os

speed = 50

with open('./config.json') as json_file:
    config = json.load(json_file)

host = config['IOT_CORE_ENDPOINT']
clientId = config['IOT_THINGNAME']
topic = clientId + '/action'

rootCAPath = './certs/cacert.pem'
certificatePath = './certs/certificate.pem'
privateKeyPath = './certs/private.pem.key'
port = 443
useWebsocket = False

def runKinesisVideoStream():
    environmentVars  = 'IOT_GET_CREDENTIAL_ENDPOINT=' + config['IOT_GET_CREDENTIAL_ENDPOINT']
    environmentVars += ' ROLE_ALIAS=' + config['ROLE_ALIAS']
    environmentVars += ' AWS_DEFAULT_REGION=' + config['AWS_DEFAULT_REGION']
    environmentVars += ' DEFAULT_KVS_CACERT_PATH=' + rootCAPath

    command = environmentVars + ' ./kvsWebrtcClientMasterGstSample ' + clientId + ' /'
    proc = subprocess.Popen(command, stdout=subprocess.PIPE, shell=True)

# Handle incoming messages and take action
#def handleMessage(message):
#    print("Received a new message: ")
#    print(message.payload)
#    print("from topic: ")
#    print(message.topic)
#    print("--------------\n\n")
#    if message.topic == topic:
#        payload = json.loads(message.payload)
#        if payload['action'] == 'forward':
#            explorerhat.motor.forwards(speed)
#        if payload['action'] == 'backwards':
#            explorerhat.motor.backwards(speed)
#        if payload['action'] == 'left':
#            explorerhat.motor.one.backwards(speed)
#            explorerhat.motor.two.forwards(speed)
#        if payload['action'] == 'right':
#            explorerhat.motor.one.forwards(speed)
#            explorerhat.motor.two.backwards(speed)
#        if payload['action'] == 'stop':
#            explorerhat.motor.stop()
#
#        time.sleep(0.2)
#        explorerhat.motor.stop()

# Init AWSIoTMQTTClient
#awsClient = AWSIoTMQTTClient(clientId)
#awsClient.configureEndpoint(host, port)
#awsClient.configureCredentials(rootCAPath, privateKeyPath, certificatePath)
#
## AWSIoTMQTTClient connection configuration
#awsClient.configureAutoReconnectBackoffTime(1, 32, 20)
#awsClient.configureOfflinePublishQueueing(-1)  # Infinite offline Publish queueing
#awsClient.configureDrainingFrequency(2)  # Draining: 2 Hz
#awsClient.configureConnectDisconnectTimeout(10)  # 10 sec
#awsClient.configureMQTTOperationTimeout(5)  # 5 sec
#awsClient.onMessage = handleMessage
#
## Connect and subscribe to AWS IoT
#awsClient.connect()
## Note that we are not putting a message callback here. We are using the general message notification callback.
#awsClient.subscribeAsync(topic, 1)
#time.sleep(2)

# Start the Kinesis Video Gstreamer Sample App using IoT Credentials
runKinesisVideoStream()
time.sleep(1)

while True:
    time.sleep(0.2)