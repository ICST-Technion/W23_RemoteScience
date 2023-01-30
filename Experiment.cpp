#include "Experiment.h"
#include "StepperMotorUtils.h"
#include <Arduino.h>
#include <Servo.h>

void Experiment::prepare(int upSteps, int angleSteps){
  Servo myservo; 
  myservo.attach(11); // attaches the servo on pin 11 to the servo object, Z+

  //y is the angle motor, x is the high motor
  StepperMotorUtils::clockWise(STEPX, DIRX, upSteps); 
  delay(2000);
  
  //turn the servo to the pull state, need to check on the system
  myservo.write(180); 
  delay(2000);
  
  StepperMotorUtils::clockWise(STEPY, DIRY, angleSteps); 
  delay(2000);
}

void Experiment::start(){
  Servo myservo;
  myservo.attach(11);
 
  //turn the servo to the start state, free the system! need to check on the system
  myservo.write(0); 
}

void Experiment::endAll(){
  //wait the maximum time till the system return to its start state- 90 sec
  delay(90000);
}
