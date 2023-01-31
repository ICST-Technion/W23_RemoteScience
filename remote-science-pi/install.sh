sudo apt-get update
sudo apt-get -y upgrade

sudo apt-get -y install curl
sudo apt-get -y install libssl-dev libcurl4-openssl-dev liblog4cplus-1.1-9 liblog4cplus-dev
sudo apt-get -y install libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev
sudo apt-get -y install gstreamer1.0-plugins-base-apps gstreamer1.0-plugins-bad
sudo apt-get -y install gstreamer1.0-plugins-good gstreamer1.0-plugins-ugly gstreamer1.0-tools
sudo apt-get -y install gstreamer1.0-omx

#if [ "$MOTOR_DRIVER" == "adafruit" ]
#then
#    sudo pip3 install adafruit-circuitpython-motorkit
#else
#    sudo apt-get -y install python3-explorerhat
#fi

#if [ "$MOTOR_DRIVER" == "adafruit" ]
#then
#    curl --silent 'https://raw.githubusercontent.com/aws-samples/aws-serverless-telepresence-robot/master/scripts/adafruit-motor-hat-main.py' --output main.py
#else
#    curl --silent 'https://raw.githubusercontent.com/aws-samples/aws-serverless-telepresence-robot/master/scripts/main.py' --output main.py
#fi

#TODO: replace to our things
cat > config.json <<EOF
{
  "IOT_THINGNAME": "RemoteSciencePi",
  "IOT_CORE_ENDPOINT": "ay40tqbrs6xxi-ats.iot.us-west-2.amazonaws.com",
  "IOT_GET_CREDENTIAL_ENDPOINT": "",
  "ROLE_ALIAS": "robot-camera-streaming-role-alias",
  "AWS_DEFAULT_REGION": ""
}
EOF

cd /home/pi/Projects

if [ "$USE_PREBUILT" == True ]
then
  cd /home/pi/Projects/RemoteScience/
  wget 'https://raw.githubusercontent.com/aws-samples/aws-serverless-telepresence-robot/master/scripts/webrtc_build/kvsWebrtcClientMasterGstSample'
  wget 'https://raw.githubusercontent.com/aws-samples/aws-serverless-telepresence-robot/master/scripts/webrtc_build/libkvsWebrtcClient.so'
  wget 'https://raw.githubusercontent.com/aws-samples/aws-serverless-telepresence-robot/master/scripts/webrtc_build/libkvsWebrtcSignalingClient.so'
  sudo chmod +x kvsWebrtcClientMasterGstSample
else
  if [ ! -d /home/pi/Projects/amazon-kinesis-video-streams-webrtc-sdk-c ]
  then
    git clone --recursive https://github.com/awslabs/amazon-kinesis-video-streams-webrtc-sdk-c.git
    cd /home/pi/Projects/amazon-kinesis-video-streams-webrtc-sdk-c
  else
    cd /home/pi/Projects/amazon-kinesis-video-streams-webrtc-sdk-c
    git pull
  fi

  git checkout 389703f1f46ce71ab0a77bf9a061feb4a44e9636
  git submodule update --recursive
  cd /home/pi/Projects/amazon-kinesis-video-streams-webrtc-sdk-c/samples
#  rm /home/pi/Projects/amazon-kinesis-video-streams-webrtc-sdk-c/samples/Common.c
#  curl --silent 'https://raw.githubusercontent.com/aws-samples/aws-serverless-telepresence-robot/master/scripts/modified-common.c' --output Common.c

  cd /home/pi/Projects/amazon-kinesis-video-streams-webrtc-sdk-c
  mkdir build
  cd build
  cmake .. 
  make

  cp /home/pi/Projects/amazon-kinesis-video-streams-webrtc-sdk-c/build/kvsWebrtcClientMasterGstSample /home/pi/Projects/RemoteScience/
fi