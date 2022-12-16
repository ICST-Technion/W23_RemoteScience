import './App.css';
import { useLayoutEffect, useState } from 'react';
import IntroPage from './IntroPage/IntroPage';
import ExperimentPage from './ExperimentPage/ExperimentPage';
import './App.css';

function App() {
  /** premission - the state of the request to start the experiment.
   * -1: an error occured
   * 0: a request to join the queue hasn't been done yet
   * 1: the current client's turm to experiment
   * premission > 1: (accessPermission -1) is the client's position in th queue
   * for example - 2 means that the current client is next.
   */
  const [accessPermission, setAccessPermission] = useState(0);
  /** the name the client will choose in order to register */
  const [clientName, setClientName] = useState("");
  /** the ID the client will get fron the server */
  const [clientID, setClientID] = useState(0);

  return (
    <div className="appRoot">
      <div className='header'>
        <h1>Remote Science</h1>
        <h2>Experiment from the comfort of your home!</h2>
      </div>
      <div className='content'>
        {
          accessPermission !== 1 ?
            <IntroPage
              accessPermission={accessPermission}
              setAccessPermission={setAccessPermission}
              clientName={clientName}
              setClientName={setClientName}
              clientID={clientID}
              setClientID={setClientID}
            /> : 
            <ExperimentPage
              accessPermission={accessPermission}
              setAccessPermission={setAccessPermission}
              clientName={clientName}
              setClientName={setClientName}
              clientID={clientID}
              setClientID={setClientID}
            />
        }
        <div className='results'>
          <div className='livestream'>
            <h3>here we will have the livestream of the experiment :)</h3>
            <iframe/>
          </div>
          <div className='datastream'>
            <h3>here we will have the data stream of the experiment :)</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
