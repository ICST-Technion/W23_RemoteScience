import { useLayoutEffect, useState } from 'react';
import './ExperimentPage.css'

const ExperimentPage = ({
  accessPermission,
  setAccessPermission,
  clientName,
  setClientName,
  clientID,
  setClientID
}) => {

  const [angleInputValue, setAngleInputValue] = useState(10);
  const [lengthInputValue, setLengthInputValue] = useState(5);
  const [runningExperiment, setRunningExperiment] = useState(false);

  const _handleAngleChange = event => {
    setAngleInputValue(event.target.value);
  }

  const _handleLengthChange = event => {
    setLengthInputValue(event.target.value);
  }

  const _handleSubmit = event => {
    event.preventDefault();
    /*fetch(`http://our_amazon_server/sendParams/${clientID}/${angleInputValue}/${lengthInputValue}`)
      .then((response)=>{
        if (response.status !== 200) {
            setAccessPermission(-1);
            return;
        }
        response.json().then((data)=>{ 
            if(data){
              setRunningExperiment(data.success==="ok");
            }
      });})
      .catch(()=>{
        setAccessPermission(-1);
        return;
      });*/
  }

  const _handleAnotherExperimentClick = () => {
    setAccessPermission(0);
    setClientID(0);
  }

  return (
    <div className='experimentPageRoot'>
      { runningExperiment ? (
        <div className='runningExperiment'>
          <h3>Thank you, {clientName}, your parameters were accepted!</h3>
          <h3>You can view the results and livestream of the experiment on the right</h3>
          <button onClick={_handleAnotherExperimentClick}>Register for another experiment</button>
        </div>
        ) : (
        <form className="paramsPageRoot" onSubmit={_handleSubmit}>
          <h2>please enter your paramters for the experiment:</h2>
          <label htmlFor="angleInput">Stick Angle: {angleInputValue}</label>
          <input
            className='angleInput'
            type="range"
            step={0.5}
            min={10}
            max={20}
            value={angleInputValue}
            onInput={_handleAngleChange}
            id="angleInput"
          />
          <label htmlFor="lengthInput">Stick length: {lengthInputValue}</label>
          <input
            className='lengthInput'
            type="range"
            step={1}
            min={5}
            max={15}
            value={lengthInputValue}
            onInput={_handleLengthChange}
            id="lengthInput"
          />
          <button className='submitParams' type='submit'>Start Experiment</button>
        </form>
        )
      }
    </div>
  );
}

export default ExperimentPage;
