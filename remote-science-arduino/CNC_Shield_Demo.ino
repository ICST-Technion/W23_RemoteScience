#include "StepperMotorUtils.h"
#include "Experiment.h"
#include <Wire.h> //This is for i2C
#include <SSD1306Ascii.h> //i2C OLED
#include <SSD1306AsciiWire.h> //i2C OLED

// i2C OLED
#define I2C_ADDRESS 0x3C
#define RST_PIN -1
SSD1306AsciiWire oled;
float OLEDTimer = 0; //Timer for the screen refresh
//I2C pins:
//STM32: SDA: PB7 SCL: PB6
//Arduino: SDA: A4 SCL: A5

//---------------------------------------------------------------------------
//Magnetic sensor things
int magnetStatus = 0; //value of the status register (MD, ML, MH)
int lowbyte; //raw angle 7:0
word highbyte; //raw angle 7:0 and 11:8
int rawAngle; //final raw angle 
float degAngle; //raw angle in degrees (360/4096 * [value between 0-4095])

int quadrantNumber, previousquadrantNumber; //quadrant IDs
float numberofTurns = 0; //number of turns
float correctedAngle = 0; //tared angle - based on the startup value
float startAngle = 0; //starting angle
float totalAngle = 0; //total absolute angular displacement
float previoustotalAngle = 0; //for the display printing

int counter = 0;

void setup() {
  Serial.begin(115200); //start serial - tip: don't use serial if you don't need it (speed considerations)
  Wire.begin(); //start i2C  
  Wire.setClock(800000L); //fast clock

  checkMagnetPresence(); //check the magnet (blocks until magnet is found)
  ReadRawAngle(); //make a reading so the degAngle gets updated
  startAngle = degAngle; //update startAngle with degAngle - for taring

  //OLED part
  #if RST_PIN >= 0
    oled.begin(&Adafruit128x32, I2C_ADDRESS, RST_PIN);
  #else // RST_PIN >= 0
    oled.begin(&Adafruit128x32, I2C_ADDRESS);
  #endif // RST_PIN >= 0

  oled.setFont(Adafruit5x7);
  oled.clear(); //clear display
  oled.set2X(); //double-line font size - better to read it
  oled.println("Welcome!"); //print a welcome message  
  oled.println("AS5600"); //print a welcome message
  delay(3000);
  OLEDTimer = millis(); //start the timer
  
  pinMode(STEPX,OUTPUT);
  pinMode(DIRX,OUTPUT);
  pinMode(STEPY,OUTPUT);
  pinMode(DIRY,OUTPUT);
  //Serial.println("Setup Finished");
  Serial.flush();
}

bool test = true;
void loop() {
/*
  if (test == true) {
    //prepare the system
    Experiment::prepare(1300, 300);

    //free the system and print all the angles
    Experiment::start();
    Serial.println("Time,Deg angle");
    for(int i=0; i<900; i++){
      ReadRawAngle(); //ask the value from the sensor
      counter = counter + 1;
      //Serial.print("Time: ");
      Serial.print(counter);
      Serial.print(",");
      //Serial.print("Deg angle: ");
      double deg = degAngle-startAngle;
      Serial.println(deg);
      delay(100); //wait a little - adjust it for "better resolution"  
    }
    //here we need to pass the angels from the sensor to rasspery pi - maybe we don't need this because print does it

    //wait till the system will stop
    Experiment::endAll();
    
    test = false;
  }
 */
  /*
   * if the syatem gets signal to start then:
   * cut the text from the remark that i symboled with "111" till the end of the setup
   */
  if( Serial.available()>0) {
    //This is running one experiment!
    //first param - length
    int mySteps= getParam(); // need to change by the user input
    int upSteps = int(mySteps * 262.195);
    int myAngleSteps= getParam(); // need to change by the user input
    int angleSteps= int(myAngleSteps*9.667);

    // for safety, prevent garbage values:
    if(int(mySteps)>8 || int(mySteps)<1 || int(myAngleSteps)<1 || int(myAngleSteps)>30)
      return;

    // Don't forget to remove these print
//    Serial.print("from arduino:");
//    Serial.println(mySteps);
//    Serial.println(upSteps);
//    Serial.println(myAngleSteps);
//    Serial.println(angleSteps);
    
    //prepare the system
    Experiment::prepare(upSteps, angleSteps);

    //release the system and print all the angles
    Experiment::start();
    //Serial.println("Time,Deg angle");
    counter = 0;
    for(int i=0; i<900; i++){
      //Serial.println("sending you data: ");
      ReadRawAngle(); //ask the value from the sensor
      //Serial.print("Time: ");
      counter++;
      Serial.print(counter);
      Serial.print(",");
      //Serial.print("Deg angle: ");
      double deg = degAngle-startAngle;
      Serial.println(deg);
      //Serial.println("data sent");
      delay(100); //wait a little - adjust it for "better resolution"  
    }
    //here we need to pass the angels from the sensor to rasspery pi - maybe we don't need this because print does it

    //wait till the system will stop
    Experiment::endAll();
  }
}

void ReadRawAngle()
{ 
  //7:0 - bits
  Wire.beginTransmission(0x36); //connect to the sensor
  Wire.write(0x0D); //figure 21 - register map: Raw angle (7:0)
  Wire.endTransmission(); //end transmission
  Wire.requestFrom(0x36, 1); //request from the sensor
  
  while(Wire.available() == 0); //wait until it becomes available 
  lowbyte = Wire.read(); //Reading the data after the request
 
  //11:8 - 4 bits
  Wire.beginTransmission(0x36);
  Wire.write(0x0C); //figure 21 - register map: Raw angle (11:8)
  Wire.endTransmission();
  Wire.requestFrom(0x36, 1);
  
  while(Wire.available() == 0);  
  highbyte = Wire.read();
  
  //4 bits have to be shifted to its proper place as we want to build a 12-bit number
  highbyte = highbyte << 8; //shifting to left
  //What is happening here is the following: The variable is being shifted by 8 bits to the left:
  //Initial value: 00000000|00001111 (word = 16 bits or 2 bytes)
  //Left shifting by eight bits: 00001111|00000000 so, the high byte is filled in
  
  //Finally, we combine (bitwise OR) the two numbers:
  //High: 00001111|00000000
  //Low:  00000000|00001111
  //      -----------------
  //H|L:  00001111|00001111
  rawAngle = highbyte | lowbyte; //int is 16 bits (as well as the word)

  //We need to calculate the angle:
  //12 bit -> 4096 different levels: 360° is divided into 4096 equal parts:
  //360/4096 = 0.087890625
  //Multiply the output of the encoder with 0.087890625
  degAngle = rawAngle * 0.087890625; 
}


void checkMagnetPresence()
{  
  //This function runs in the setup() and it locks the MCU until the magnet is not positioned properly

  while((magnetStatus & 32) != 32) //while the magnet is not adjusted to the proper distance - 32: MD = 1
  {
    magnetStatus = 0; //reset reading

    Wire.beginTransmission(0x36); //connect to the sensor
    Wire.write(0x0B); //figure 21 - register map: Status: MD ML MH
    Wire.endTransmission(); //end transmission
    Wire.requestFrom(0x36, 1); //request from the sensor

    while(Wire.available() == 0); //wait until it becomes available 
    magnetStatus = Wire.read(); //Reading the data after the request

    //Serial.print("Magnet status: ");
    //Serial.println(magnetStatus, BIN); //print it in binary so you can compare it to the table (fig 21)      
  }      
   
}

int getParam() {
  String inString = "";
  while (Serial.available() > 0) {
    int inChar = Serial.read();
    //Serial.print("GOT: ");
    //Serial.println((char)inChar);
    if (isDigit(inChar)) {
      // convert the incoming byte to a char and add it to the string:
      inString += (char)inChar;
    }
    // if you get a newline, print the string, then the string's value:
    if (inChar == '\n'){
      //Serial.print("In Get Params: ");
      //Serial.println(inString);
      return inString.toInt();
    }
  }
}
