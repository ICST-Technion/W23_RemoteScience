#include "Experiment.h"
#include "StepperMotorUtils.h"
#include <Arduino.h>
#include <Servo.h>

void Experiment::prepare(int lowSteps, int angleSteps){
 
  
  //first line: lower the motor#1 by the user data. need to change steps=data's high
  //second line: move the motor#2 to x=0, need to check what is steps(till x=0) instead of steps=2000
  StepperMotorUtils::clockWise(STEPX, DIRX, lowSteps); 
  StepperMotorUtils::clockWise(STEPY, DIRY, 2000); 
  delay(2000);

  Servo myservo; 
  myservo.attach(11); // attaches the servo on pin 11 to the servo object, Z+
  //turn the servo to the pull state, need to check on the system
  myservo.write(180); 
  delay(2000);
  
  //motor#2: take back the rod by the user angle, need to chage steps = data's angle  
  StepperMotorUtils::counterClockWise(STEPY, DIRY, angleSteps); 
  delay(2000);
}

void Experiment::start(){
  Servo myservo;
  myservo.attach(11);
 
  //turn the servo to the start state, free the system! need to check on the system
  myservo.write(180); 
  
  //the angle sensor need to document the movement
  //maybe send the results to the rasberry pi
}

void Experiment::endAll(int raiseSteps, int takingBackSteps){
  //wait the maximum time till the system return to its start state
  //sending the results to the rasberry pi

  //motor#1: raise the motor#1 to his start state. steps=data's high
  //motor#2: take back the rod to the start state, need to chage the steps=steps(till x=0)-steps(till data's angle)
  StepperMotorUtils::counterClockWise(STEPX, DIRX, raiseSteps);
  StepperMotorUtils::counterClockWise(STEPY, DIRY, takingBackSteps);
  
  //maybe reset the angle sensor  
}
