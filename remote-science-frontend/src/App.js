import './App.css';
import { useLayoutEffect, useState } from 'react';
import IntroPage from './IntroPage/IntroPage';
import ParamsPage from './ParamsPage/ParamsPage';

function App() {
  /*useLayoutEffect(() => {
    fetch(`http://our_amazon_server/permission`)
    .then((response)=>{
      if (response.status !== 200) {
          setPermission(-1);
          return;
      }
      response.json().then((data)=>{ 
          if(data && data.permission){
            const currentPermission = data.permission;
            setPermission(currentPermission);
          }
    });})
    .catch(()=>{
      setPermission(-1);
      return;
    });
  }, []);*/

  const [permission, setPermission] = useState(1);

  return (
    <div className="App">
      <h1>Welcome to Remote Science!</h1>
      <div className='results'>
        <div className='livestream'>
          <h2>here we will have the livestream of the experiment :)</h2>
          <iframe>
          </iframe>
        </div>
        <div className='datastream'>
          <h2>here we will have the data stream of the experiment :)</h2>
        </div>
      </div>
      <div className='permission'>
        {
          permission !== 1 ? <IntroPage permission setPermission/> : <ParamsPage permission setPermission/>
        }
      </div>
    </div>
  );
}

export default App;
