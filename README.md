# RemoteScience
This project aims to support conducting experiments online, without the need for human intervention. This is a POC to encourage schools around the world to create similar experiments and share them.\
In this project, we support experimenting with a simple pendulum.\
The system in the projects allows users to set the release angle and length of the pendulum via a web interface, then conducts the experiment with the required parameters, while livestreaming it to the user and recording the results of the experiment. When the experiment is done, a results file is available for the user to download from the web interface.\
The web interface is available here:
[Remote Sciece website](http://remotesciencebucket.s3-website-us-west-2.amazonaws.com/)\

Team members: Adi Falach, Stav Roth, Mai Barishansky\
Lecturer: Itay Dabran\
Instructors: Tom Sofer, Aseel Aborokn

## This Repo
This repo contains all the code we wrote for this project, divided to directories:
1. remote-science-frontend - the react application for the web page
2. remote-science-pi - the code for the Raspberry Pi
3. remote-science-arduino - the code that runs on the arduino to conduct the experiment
4. remote-science-lambdas - the code for the lambda functions that run on aws services.
5. assets - contains additional files: poster and system diagrams (for this README and WIKI) and SECRETS.json file which is a template for all the keys you will need to run this project.
6. unit-tests - the tests we use to check small components of our system.
## System Architechture
![System Diagram](/assets/RemoteScienceDiagram.png)

The system has 4 main parts:
1. **The pendulum** (bottom left corner of the diagram): It is moved by a stepper motor to change the length, and a servo and stepper motor to change the angle. The pendulum also has an AS5600 angle sensor to measure the angle while cinducting the experiment. All motors and the sensor are connected to an Ardurino controller to control the motion of the pendulum.
2. **Raspberry Pi**: Used to manage network communications. The Pi receives commands from the client (via aws services - see 3) and passes them to the Arduino. It also receives data from the Arduino, creates the results file from it and uploads it to S3 service in aws, so that the client can download it. Moreover, the Pi is connected to a camare that records the experiment, and it sends the video to youtube live so it can live stream the experiment to the client.
3. **Amazom web services** (aws - all the green boxes): Our goal is to allow conducting the experiment online, so our users are not connected to the same network as our system. Hence, we need an external service that both our system (the raspberry pi) and our users can communicate with, and for that we use aws. We use several services from aws:
* IoT core - allows our aws account to communicate with our Pi and control it via Shadow interface. A Shadow is a .json file that our Pi and Core can read and write to (and change their actions accordingly). For example, when the Core writes to the shadow parameters for a new experiment, the Pi reads them and passes them to the Arduino to conduct the experiment, and when the experiment is done the Pi writes to the Shadow the name of the file where the results are stored - so the core can notify the gateway that the experiment is over.
* Lambda functions and Gateway API services - lambda functions are used to read and write to the shadow (from aws services), and Gateway API gives us sn API we can use in order to access and run the lambda function (this API is accessed from the web page).
* S3 - we use S3 for 2 purposes. First, this is a storage server that we use to store the result files of the experiments, the raspberry pi upload the files there when an experiment is done. Second, it is used as a host for our react application.
* IAM - for managing permissions between the different services and enabling aws cli.
4. **Youtube live**: our Pi uses a camera to film the pendulum whlile an experiment is conducted, and we use youtube live to stream the experiment to the client (the live video is embedded in the web page).
### User Interface Documentation:
#### Statuses:
1. Landing Page - the users enter the website and can register to join the queue.
2. Waiting in queue - the users wait for their turn to conduct an experiment.
3. Conducting an experiment -  the users can pass parameters for the experiment and start it.
4. Waiting for results - after the experiment is over a results file is available for the users to download.
5. Error state - represents states where an error in the network occured.

#### Parameters:
Users can control the parameters for the experiment - pendulum length and pendulum angle.

## Recreate this Project
See our [Wiki](https://github.com/adifalach/RemoteScience/wiki) :)


## Poster for the Project
![Poster](/assets/poster.png)
