#include "StepperMotorUtils.h"
#include "Experiment.h"

void setup() {
  pinMode(STEPX,OUTPUT);
  pinMode(DIRX,OUTPUT);
  pinMode(STEPY,OUTPUT);
  pinMode(DIRY,OUTPUT);

  //need to get the input from the user
  int lowSteps= 2000; // need to change by the user input
  int angleSteps= 2000; // need to change by the user input

  //prepare the system
  Experiment::prepare(lowSteps, angleSteps);

  //start the experimrnt and send the data to the pi
  Experiment::start(); //need to complete
  
  //ypdate the input to the end of the system
  int raiseSteps = lowSteps; //the rasing of the motor for its start state is like its lowing
  int takingBackSteps = 2000; //need to change by the user data to: steps=steps(till x=0)-steps(till data's angle)

  //
  Experiment::endAll(raiseSteps, takingBackSteps);
}

void loop() {
 
}
