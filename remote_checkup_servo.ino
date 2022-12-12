
/*
  Rui Santos
  Complete project details at https://RandomNerdTutorials.com/esp32-webserial-library/
  
  This sketch is based on the WebSerial library example: ESP32_Demo
  https://github.com/ayushsharma82/WebSerial
*/
#include <ESP32Servo.h>
#include <Arduino.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <WebSerial.h>

AsyncWebServer server(80);

//motor
Servo myservo;
int pos = 0;    // variable to store the servo position
// Recommended PWM GPIO pins on the ESP32 include 2,4,12-19,21-23,25-27,32-33 
int servoPin = 18;

const char* ssid = "HOTBOX 4-CE08"; //"REPLACE_WITH_YOUR_SSID";          // Your WiFi SSID
const char* password = "adan1234"; //"REPLACE_WITH_YOUR_PASSWORD";  // Your WiFi Password

//eceives incoming messages sent from the web-based serial monitor. 
//The message is saved on the d variable. 
//Then, it is printed on the web serial monitor using WebSerial.println(d)
void recvMsg(uint8_t *data, size_t len){
  WebSerial.println("Received Data...");
  String d = "";
  for(int i=0; i < len; i++){
    d += char(data[i]);
  }
  WebSerial.println(d);
  if (d == "180"){
    myservo.write(180);
  }
  if (d=="0"){
    myservo.write(0);
  }
}

void setup() {
  Serial.begin(115200);
//  //LED is our output
//  pinMode(LED, OUTPUT); 
  // Connect the board to your local network:
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  if (WiFi.waitForConnectResult() != WL_CONNECTED) {
    Serial.printf("WiFi Failed!\n");
    return;
  }
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  // WebSerial is accessible at "<IP Address>/webserial" in browser
  WebSerial.begin(&server);
  // The recvMsg() function will run whenever we send a message from the monitor to the board.
  WebSerial.msgCallback(recvMsg);
  //after calling this line, the web-based serial monitor will start working.
  server.begin();

  // motor
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  myservo.setPeriodHertz(50);    // standard 50 hz servo
  myservo.attach(servoPin, 500, 2400); 
}

void loop() {
  WebSerial.println("Hello!");
  delay(2000);
}
