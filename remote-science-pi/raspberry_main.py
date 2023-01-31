from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
from awscrt import mqtt
import subprocess
import signal
import json
import time
import sys
import os
import boto3
import random
import serial

# arduino - hardware
#ser = serial.Serial('/dev/ttyACM0', 115200, timeout=1)

# config
with open('./config.json') as json_file:
    config = json.load(json_file)

host = config['IOT_CORE_ENDPOINT']
clientId = config['IOT_THINGNAME']
# topic = clientId + '/action'

# MQTT communication
AWS_IOT_PUBLISH_TOPIC = "$aws/things/RemoteSciencePi/shadow/name/remote_science_shadow/update" # for sending URL
AWS_IOT_SUBSCRIBE_TOPIC = "$aws/things/RemoteSciencePi/shadow/update/delta" # for receiving requests
AWS_IOT_CONFIRM_TOPIC = "$aws/things/RemoteSciencePi/shadow/update" # for confiming the request
s3 = boto3.client("s3")

rootCAPath = './certs/Amazon-root-CA-3.pem' #if not working try 1 instead of 3
certificatePath = './certs/certificate.pem.crt'
privateKeyPath = './certs/private.pem.key'
port = 443
useWebsocket = False

def runYoutubeVideoStream():
	# explenation regarding parameters can be found in the project drive
  command = 'raspivid -p 100,100,100,100 -o - -t 0 -vf -hf -fps 60 -b 12000000 -rot 180 | ffmpeg -re -ar 44100 -ac 2 -acodec pcm_s16le -f s16le -ac 2 -i /dev/zero -i - -vcodec copy -acodec aac -ab 384k -g 17 -strict experimental -f flv rtmp://a.rtmp.youtube.com/live2/'
  command += config['YOUTUBE_KEY']    

  livestream_proc = subprocess.Popen(command, stdout=subprocess.PIPE, shell=True, preexec_fn=os.setsid) #preexec_fn=os.setsid to make independent from parent
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

  # silence delta - if received -1,-1 or received parameters
  confirm_payload = json.dumps({
    'state': { 
      'reported': { 
        'action': "start", 
        'length': payload['state']['length'], 
        'angle': payload['state']['angle'], 
        'result':  "-"
      }
    }
  })
  
  awsClient.publish(
    topic=AWS_IOT_CONFIRM_TOPIC,
    payload=confirm_payload,
    QoS=0
  )
  
  # if -1-1 end else Continue
  if (payload['state']['length'] == "-1") or (payload['state']['angle'] == "-1"):
    print("entered\n")
    return
    
  # START EXPERIMENT

  # kill the waiting-video process
  # waiting_process.kill()
  proc = runYoutubeVideoStream() # start broadcasting 
  
  # connect to arduino, send parameters
  #ser.write(payload['state']['length'] + "\n".encode('utf-8'))
  #ser.write(payload['state']['angle'] + "\n".encode('utf-8'))
  
  # listen to arduino result, collide into file. if 'stop' was sent then the file will be partial(?)
  #while True:
   # if ser.in_waiting > 0:
    #  line = ser.readline().decode('utf-8').rstrip() # reads until \n - one result.
     # print(line)
          
  generated_file = str(random.randint(0,999999)) + ".txt"
  # send file to S3
  s3.upload_file(
      Filename="sample_results.txt",
      Bucket="remotesciencebucket",
      Key="data/" + generated_file
  )
  
  # upload link to named shadow
  link="https://remotesciencebucket.s3.us-west-2.amazonaws.com/data/" + generated_file
  result_payload = json.dumps({'state': { 'reported': { 'action': '-', 'length': '-', 'angle': '-', 'result': link } }})
  awsClient.publish(
    topic=AWS_IOT_PUBLISH_TOPIC,
    payload=result_payload,
    QoS=0
  )
      
  time.sleep(90) # change to sleep T
  os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
 
  
  # elif action == "stop": Future feature - allow stopping of the experiment - dont send the data to the user
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
  awsClient.onMessage = lambda message: handleMessage(awsClient, message)

  # Connect and subscribe to AWS IoT
  awsClient.connect()
  # Note that we are not putting a message callback here. We are using the general message notification callback.
  awsClient.subscribeAsync(AWS_IOT_SUBSCRIBE_TOPIC, 1)
  time.sleep(2)

connectAWS()
#ser.reset_input_buffer()
while True: # listen to messages 
  time.sleep(0.2)