#include "StepperMotorUtils.h"
#include <Arduino.h>

//STEP= the right step entrie, DIR= the right dir entrie, stepd= how many steps, dir= HIGH/LOW for clockwise/counterClockWise
void StepperMotorUtils::rotate(int STEP, int DIR, int steps, int dir) {
  pinMode(STEP, OUTPUT);
  pinMode(DIR, OUTPUT);

  // set direction, HIGH for clockwise, LOW for anticlockwise
  digitalWrite(DIR, dir);
  for (int x = 0; x < steps; x++) { // loop for X steps
    digitalWrite(STEP, LOW);
    delayMicroseconds(2000 ); //tom modified
    //delay(4); //tom modified

    digitalWrite(STEP, HIGH);
    delayMicroseconds(2000); //tom modified  
    //delay(4); //tom modified
  }
  delay(1000); // delay for 1 second
}

//STEP= the right step entrie, DIR= the right dir entrie, stepd= how many steps
void StepperMotorUtils::clockWise(int STEP, int DIR, int steps) {
  rotate(STEP, DIR, steps, HIGH);
}

//STEP= the right step entrie, DIR= the right dir entrie, stepd= how many steps
void StepperMotorUtils::counterClockWise(int STEP, int DIR, int steps) {
  rotate(STEP, DIR, steps, LOW);
}
