import { useLayoutEffect, useState } from 'react';
import Loading from '../Helpers/Loading';
import './ExperimentPage.css';

const ExperimentPage = ({
  accessPermission,
  setAccessPermission,
  clientName,
  setClientName,
  clientID,
  setClientID,
  experimentTime,
}) => {

  const [angleInputValue, setAngleInputValue] = useState(10);
  const [lengthInputValue, setLengthInputValue] = useState(5);
  const [runningExperiment, setRunningExperiment] = useState(false);
  const [resultsFile, setResultsFile] = useState("");

  const _handleAngleChange = event => {
    setAngleInputValue(event.target.value);
  }

  const _handleLengthChange = event => {
    setLengthInputValue(event.target.value);
  }

  const _handleSubmit = event => {
    event.preventDefault();
    // TODO: add clientID when we add support for multiple users.
    const requestBody = {
      "thingname" : "RemoteSciencePi",
      "action" : "start",
      "length": lengthInputValue,
      "angle": angleInputValue
    };

    fetch(`https://pnoaa2t5si.execute-api.us-west-2.amazonaws.com/Beta/shadow-state`, {
      method: 'POST',
      body: JSON.stringify(requestBody)
    }).then((response)=>{
        if (response.status !== 200) {
            setAccessPermission(-1);
            return;
        }
        response.json().then((data)=>{ 
            if(data && data==="Shadow Updated!"){
              setRunningExperiment(true);
              setTimeout(()=> {
                _handleResults()
              }, experimentTime*100);
            }
      });})
      .catch(()=>{
        setAccessPermission(-1);
        return;
      });
  }

  const _handleAnotherExperimentClick = () => {
    setAccessPermission(0);
    setClientID(0);
  }

  const _handleStopExperimentClick = () => {
    const requestBody = {
      "thingname" : "RemoteSciencePi",
      "action" : "stop"
    };

    fetch(`https://pnoaa2t5si.execute-api.us-west-2.amazonaws.com/Beta/shadow-state`, {
      method: 'POST',
      body: JSON.stringify(requestBody)
    }).then((response)=>{
        if (response.status !== 200) {
          setAccessPermission(-1);
          return;
        }
        response.json().then((data)=>{ 
          if(data && data==="Shadow Updated!"){
            setAccessPermission(0);
            setClientID(0);
          }
      });})
      .catch(()=>{
        setAccessPermission(-1);
        return;
      });
  }

  const _handleResults = () => {
    fetch(`https://pnoaa2t5si.execute-api.us-west-2.amazonaws.com/Beta/shadow-state?thingname=RemoteSciencePi`)
      .then((response)=>{
        if (response.status !== 200) {
          setAccessPermission(-1);
          return;
        }
        response.json().then((data)=>{ 
          if(data && data.result){
            setResultsFile("https://remotesciencebucket.s3.us-west-2.amazonaws.com/index.html");
          }
      });})
      .catch(()=>{
        setAccessPermission(-1);
        return;
      });
  }

  return (
    runningExperiment ? (
      <div className='experimentPageRoot runningExperiment'>
        <h3>Thank you, {clientName}, your parameters were accepted!</h3>
        <h3>Pendulum angle: {angleInputValue} (degrees); Pendulum length: {lengthInputValue} (mm)</h3>
        <h3>You can view the livestream of the experiment on the right</h3>
        {resultsFile?
          <a href={resultsFile} download className='results'>Download Results</a>
          :
          <Loading className='results' message={`waiting for results`}/>
        }
        {resultsFile?
          <button onClick={_handleAnotherExperimentClick}>Register for another experiment</button>
          :
          <button onClick={_handleStopExperimentClick}>Stop experiment</button>
        }
      </div>
      ) : (
      <form className="experimentPageRoot paramsPageRoot" onSubmit={_handleSubmit}>
        <h3>Please enter your paramters for the experiment:</h3>
        <label className='description' htmlFor="angleInput">Pendulum Angle: {angleInputValue} degrees</label>
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
        <label className='description' htmlFor="lengthInput">Pendulum length: {lengthInputValue} mm</label>
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
        <button className='back' onClick={_handleStopExperimentClick}>Cancel</button>
      </form>
      )
  );
}

export default ExperimentPage;
