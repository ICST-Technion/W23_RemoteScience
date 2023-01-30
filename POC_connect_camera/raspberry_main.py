# Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# Permission is hereby granted, free of charge, to any person obtaining a copy of this
# software and associated documentation files (the "Software"), to deal in the Software
# without restriction, including without limitation the rights to use, copy, modify,
# merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so.
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
# INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
# PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
# HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
# SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
# from adafruit_motorkit import MotorKit
# kit = MotorKit()
import subprocess
import signal
import json
import time
import sys
import os
import boto3

AWS_IOT_PUBLISH_TOPIC = "$aws/things/RemoteSciencePi/shadow/update"
AWS_IOT_SUBSCRIBE_TOPIC = "$aws/things/RemoteSciencePi/shadow/update/delta"
# sndPayloadSuccess = "{\"state\": { \"reported\": { \"status\": \"on\" } }}"
# speed = 0.7
s3 = boto3.client("s3")

with open('./config.json') as json_file:
    config = json.load(json_file)

host = config['IOT_CORE_ENDPOINT']
clientId = config['IOT_THINGNAME']
topic = clientId + '/action'

# MQTT communication
rootCAPath = './certs/Amazon-root-CA-3.pem' #if not working try 1 instead of 3
certificatePath = './certs/certificate.pem'
privateKeyPath = './certs/private.pem.key'
port = 443
useWebsocket = False

def runYoutubeVideoStream():
	# explenation regarding parameters can be found in the project drive
  command = 'raspivid -o - -t 0 -vf -hf -fps 60 -b 12000000 -rot 180 | ffmpeg -re -ar 44100 -ac 2 -acodec pcm_s16le -f s16le -ac 2 -i /dev/zero -i - -vcodec copy -acodec aac -ab 384k -g 17 -strict experimental -f flv rtmp://a.rtmp.youtube.com/live2/'
  command += config['YOUTUBE_KEY']    

  proc = subprocess.Popen(command, stdout=subprocess.PIPE, shell=True)
  return proc

def runWaitingVideoStream():
  pass


# Handle incoming messages and take action
def handleMessage(message):
  print("Received a new message: ")
  print(message.payload)
  print("from topic: ")
  print(message.topic)
  print("--------------\n\n")

  res = message['payload'].read()
  res_json = json.loads(res)
  # StaticJsonDocument<200> doc;
  # DeserializationError error_sensor = deserializeJson(doc, message);
  # const char *stat = doc["state"]["status"];
  action = res_json['state']['desired']['action']

  # if message.topic == topic: # START EXPERIMENT
  if action == "start":
    # kill the waiting-video process
    #waiting_process.kill()
    runYoutubeVideoStream() # start broadcasting 
    # connect to arduino, send parameters
    # listen to arduino result, collide into file

    # send file to S3
    s3.upload_file(
        Filename="data/results.csv",
        Bucket="remotesciencebucket",
        Key="sample_results.csv",
    )
    # update the shadow with the link to results file in S3
    # client.publish(AWS_IOT_PUBLISH_TOPIC, sndPayloadOn);
  elif action == "stop":
    #livestream_process.kill()
    runWaitingVideoStream()

  time.sleep(0.2)


def connectAWS():
  # Init AWSIoTMQTTClient
  awsClient = AWSIoTMQTTClient(clientId)
  awsClient.configureEndpoint(host, port)
  awsClient.configureCredentials(rootCAPath, privateKeyPath, certificatePath)

  # AWSIoTMQTTClient connection configuration
  awsClient.configureAutoReconnectBackoffTime(1, 32, 20)
  awsClient.configureOfflinePublishQueueing(-1)  # Infinite offline Publish queueing
  awsClient.configureDrainingFrequency(2)  # Draining: 2 Hz
  awsClient.configureConnectDisconnectTimeout(10)  # 10 sec
  awsClient.configureMQTTOperationTimeout(5)  # 5 sec
  awsClient.onMessage = handleMessage

  # Connect and subscribe to AWS IoT
  awsClient.connect()
  # Note that we are not putting a message callback here. We are using the general message notification callback.
  awsClient.subscribeAsync(AWS_IOT_SUBSCRIBE_TOPIC, 1)
  time.sleep(2)

connectAWS()
while True: # listen to messages 
  time.sleep(0.2)
