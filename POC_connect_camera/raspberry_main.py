from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
from awscrt import mqtt
import subprocess
import signal
import json
import time
import sys
import os
import boto3

AWS_IOT_PUBLISH_TOPIC = "$aws/things/RemoteSciencePi/shadow/update"
AWS_IOT_SUBSCRIBE_TOPIC = "$aws/things/RemoteSciencePi/shadow/update/delta"
s3 = boto3.client("s3")

with open('./config.json') as json_file:
    config = json.load(json_file)

host = config['IOT_CORE_ENDPOINT']
clientId = config['IOT_THINGNAME']
topic = clientId + '/action'

# MQTT communication
rootCAPath = './certs/Amazon-root-CA-3.pem' #if not working try 1 instead of 3
certificatePath = './certs/certificate.pem.crt'
privateKeyPath = './certs/private.pem.key'
port = 443
useWebsocket = False

def runYoutubeVideoStream():
	# explenation regarding parameters can be found in the project drive
  command = 'raspivid -p 100,100,100,100 -o - -t 0 -vf -hf -fps 60 -b 12000000 -rot 180 | ffmpeg -re -ar 44100 -ac 2 -acodec pcm_s16le -f s16le -ac 2 -i /dev/zero -i - -vcodec copy -acodec aac -ab 384k -g 17 -strict experimental -f flv rtmp://a.rtmp.youtube.com/live2/'
  command += config['YOUTUBE_KEY']    

  livestream_proc = subprocess.Popen(command, stdout=subprocess.PIPE, shell=True) #preexec_fn=os.setsid to make independent from parent
  return livestream_proc

def runWaitingVideoStream():
  pass


# Handle incoming messages and take action
def handleMessage(awsClient, message):
  print("Received a new message: ")
  print(message.payload)
  print("from topic: ")
  print(message.topic)
  print("--------------\n\n")
  
  payload = json.loads(message.payload)
  action = payload['state']['action']

  # START EXPERIMENT
  if action == "start":
    # kill the waiting-video process
    # waiting_process.kill()
    proc = runYoutubeVideoStream() # start broadcasting 
    # print(proc.pid)
    
    # connect to arduino, send parameters
    # listen to arduino result, collide into file. if 'stop' was sent then the file will be partial(?)

    # send file to S3
    s3.upload_file(
        Filename="sample_results.txt",
        Bucket="remotesciencebucket",
        Key="data/sample_results.txt",
    )
    # FUTURE FEATURE - update the shadow with the link to results file in S3
    # The segment below currently raises timeout due to AWS limitations.
    
    # link="https://remotesciencebucket.s3.us-west-2.amazonaws.com/data/sample_results.txt"
    # payload = json.dumps({'state': { 'reported': { 'action': '-', 'length': '-', 'angle': '-', 'result': link } }})
    # awsClient.publish(
     #   topic=AWS_IOT_PUBLISH_TOPIC,
     #   payload="s",
    #  QoS=1 
    # )
        
    time.sleep(10) # change to sleep T
    print("slept")
    # proc.kill()
    os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
   
  
  # elif action == "stop": FUTURE FEATURE  - allow stopping of the experiment - dont send the data to the user
	#  # ask arduino to stop.
	
  #  livestream_proc.kill()
  #  runWaitingVideoStream()

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
  # awsClient.configureConnectDisconnectTimeout(10)  # 10 sec
  # awsClient.configureMQTTOperationTimeout(5)  # 5 sec
  awsClient.onMessage = lambda message: handleMessage(awsClient,message)

  # Connect and subscribe to AWS IoT
  awsClient.connect()
  # Note that we are not putting a message callback here. We are using the general message notification callback.
  awsClient.subscribeAsync(AWS_IOT_SUBSCRIBE_TOPIC, 1)
  time.sleep(2)

connectAWS()
while True: # listen to messages 
  time.sleep(0.2)