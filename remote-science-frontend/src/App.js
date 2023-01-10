import './App.css';
import { useLayoutEffect, useState } from 'react';
import IntroPage from './IntroPage/IntroPage';
import ExperimentPage from './ExperimentPage/ExperimentPage';
import './App.css';
import {ReactComponent as RemoteScienceLogo} from './Helpers/RemoteScience.svg';

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

  const experimentTime = 180;

  return (
    <div className="appRoot">
      <div className='header'>
        <h1 className='pageTitle'><RemoteScienceLogo className='logo'/>Remote Science</h1>
        <h2 className='pageSubtitle'>Experiment from the comfort of your home!</h2>
      </div>
      <div className='content'>
        <div className='experiment'>
          {
            accessPermission !== 1 ?
              <IntroPage
                accessPermission={accessPermission}
                setAccessPermission={setAccessPermission}
                clientName={clientName}
                setClientName={setClientName}
                clientID={clientID}
                setClientID={setClientID}
                experimentTime={experimentTime}
              /> : 
              <ExperimentPage
                accessPermission={accessPermission}
                setAccessPermission={setAccessPermission}
                clientName={clientName}
                setClientName={setClientName}
                clientID={clientID}
                setClientID={setClientID}
                experimentTime={experimentTime}
              />
          }
        </div>
          <div className='livestreamWrapper'>
            <h3 className='description'>View the current experiment:</h3>
            <iframe className='livestream'  src="https://www.youtube.com/embed/live_stream?channel=UCV6mxW8F-Ei6Dos__SrTJ5A"/>
          </div>
        </div>
    </div>
  );
}

export default App;
