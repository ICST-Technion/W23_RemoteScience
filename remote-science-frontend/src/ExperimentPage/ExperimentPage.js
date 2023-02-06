import { useLayoutEffect, useState } from 'react';
import Loading from '../Helpers/Loading';
import './ExperimentPage.css';

const ExperimentPage = ({
  setAccessPermission,
  clientName,
  clientID,
  setClientID,
  experimentTime,
}) => {

  const [angleInputValue, setAngleInputValue] = useState(1);
  const [lengthInputValue, setLengthInputValue] = useState(1);
  const [runningExperiment, setRunningExperiment] = useState(false);
  const [resultsFile, setResultsFile] = useState("");
  const [experimentTimeout, setExperimentTimeout] = useState(undefined);

  const _handleAngleChange = event => {
    setAngleInputValue(event.target.value);
  }

  const _handleLengthChange = event => {
    setLengthInputValue(event.target.value);
  }

  const _removeFromQueue = () => {
    const qRequestBody = {
      "action" : "remove",
      "clientID": clientID,
      "clientName": clientName
    };
  
    fetch("https://1b6ei90gue.execute-api.us-west-2.amazonaws.com/default/Queue_API", {
      method: 'POST',
      body: JSON.stringify(qRequestBody)
    })
      .then((response)=>{
        if (response.status !== 200) {
          setAccessPermission(-1);
          return;
        }
        response.json().then((data)=>{
            if(data){
              console.log("removed");
            }
      });})
      .catch(()=>{
        setAccessPermission(-1);
        return;
      });
  }

  const _handleSubmit = event => {
    event.preventDefault();
    // TODO: add clientID when we add support for multiple users.
    const expRequestBody = {
      "thingname" : "RemoteSciencePi",
      "action" : "start",
      "length": lengthInputValue,
      "angle": angleInputValue
    };

    const qRequestBody = {
      "action" : "status_check",
      "clientID": clientID,
      "clientName": clientName
    };
    //first check there was no timeout and we are still in line
    fetch("https://1b6ei90gue.execute-api.us-west-2.amazonaws.com/default/Queue_API", {
      method: 'POST',
      body: JSON.stringify(qRequestBody)
    })
      .then((response)=>{
        if (response.status !== 200) {
          setAccessPermission(-1);
          return;
        }
        response.json().then((data)=>{
            if(data && data.access_permission === 1){
              // if we are in line, send request
              fetch(`https://pnoaa2t5si.execute-api.us-west-2.amazonaws.com/Beta/shadow-state`, {
                method: 'POST',
                body: JSON.stringify(expRequestBody)
              }).then((response)=>{
                  if (response.status !== 200) {
                      setAccessPermission(-1);
                      return;
                  }
                  response.json().then((data)=>{ 
                      if(data && data==="Shadow Updated!"){
                        setRunningExperiment(true);
                        setExperimentTimeout(setTimeout(()=> {
                          _handleResults()
                        }, experimentTime));
                      }
                });})
                .catch(()=>{
                  setAccessPermission(-1);
                  return;
                });
            }
      });})
      .catch(()=>{
        setAccessPermission(-1);
        return;
      });
  }

  const _handleAnotherExperimentClick = () => {
    setAccessPermission(0);
    setRunningExperiment(false);
    setResultsFile("");
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
            setRunningExperiment(false);
            setResultsFile("");
            clearTimeout(experimentTimeout);
            setExperimentTimeout(undefined);
            setClientID(0);
          }
      });})
      .catch(()=>{
        setAccessPermission(-1);
        return;
      });
    
    _removeFromQueue();
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
            const filename = data.result;
            setResultsFile(filename);
          }
      });})
      .catch(()=>{
        setAccessPermission(-1);
        return;
      });
    
    _removeFromQueue();
  }

  return (
    runningExperiment ? (
      <div className='experimentPageRoot runningExperiment'>
        <h3>Thank you, {clientName}, your parameters were accepted!</h3>
        <h3>Pendulum angle: {angleInputValue} (degrees); Pendulum length: {lengthInputValue} (cm)</h3>
        <h3>You can view the livestream of the experiment on the right</h3>
        {resultsFile?
          <a href={resultsFile} download className='results' target="_blank">Download Results</a>
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
          step={1}
          min={1}
          max={30}
          value={angleInputValue}
          onInput={_handleAngleChange}
          id="angleInput"
        />
        <label className='description' htmlFor="lengthInput">Pendulum length: {lengthInputValue} cm</label>
        <input
          className='lengthInput'
          type="range"
          step={1}
          min={1}
          max={8}
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
