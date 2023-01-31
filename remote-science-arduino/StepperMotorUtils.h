#define STEPX 2
#define DIRX 5
#define STEPY 3
#define DIRY 6

class StepperMotorUtils {
  private:
    static void rotate(int STEP, int DIR, int steps, int dir);
  public:

  
    static void clockWise(int STEP, int DIR, int steps);
    /*
     * Turn the motor colockwise
     * @param step - When you pulse this pin HIGH then LOW, the motor moves forward one step. Also functions as a configuration pin for microstepping.
     * @param steps - how many steps
     * @param dir -  When you pulse this pin HIGH, the motor in one direction when you pulse the step pin. When you take it LOW, it moves in the other. 
     * Also functions as a configuration pin for microstepping.
     */
    static void counterClockWise(int STEP, int DIR, int steps);
    
    /*
     * Turn left the motor counter clockwise
     * @param step - step pin
     * @param steps - how many steps
     * @param dir - dir pin
     */
};
  
