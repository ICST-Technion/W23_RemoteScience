import { useEffect, useState } from 'react';
import './IntroPage.css';

const IntroPage = ({
  accessPermission,
  setAccessPermission,
  clientName,
  setClientName,
  clientID,
  setClientID,
  experimentTime
}) => {
  const [nameInputValue, setNameInputValue] = useState(clientName);

  const _handleRequests = action => {
    const requestBody = {
      "action" : action,
      "clientID": clientID,
      "clientName": clientName
    };

    fetch("https://1b6ei90gue.execute-api.us-west-2.amazonaws.com/default/Queue_API", {
      method: 'POST',
      body: JSON.stringify(requestBody)
    })
      .then((response)=>{
        if (response.status !== 200) {
          setAccessPermission(-1);
          return;
        }
        response.json().then((data)=>{
            if(data){
              const currentAccessPermission = data.access_permission;
              const currentClientID = data.clientID;
              if(action === "register") {
                setClientID(currentClientID);
                setAccessPermission(currentAccessPermission);
              }
              if(action === "status_check") {
                setAccessPermission(currentAccessPermission);

              }
              if(action === "remove") {
                setAccessPermission(0);
                setClientID(0);
              }
              return currentAccessPermission
            }
      });})
      .catch(()=>{
        setAccessPermission(-1);
        return;
      });
  }

  useEffect(() => {
    /** if accessPermission > 1, meaning a request to join the queue has been done
     * and it's not the current client's turn yet, we sent a request every 4 minutes
     * to find our status on the queue and update the UI accordingly
     * */
    if(accessPermission>1){
      let reload = setTimeout(()=> {
        setAccessPermission(_handleRequests("status_check"))
      }, experimentTime);
      return () => {
        clearTimeout(reload);
      }
    }
  });

  const Error = () => (
    <div className='introPageRoot error'>
      <h2>Sorry, an error occured :(</h2>
      <h2>Please try again later!</h2>
    </div>
  )

  const _handleNameChange = event => {
    setNameInputValue(event.target.value);
  }

  const _handleSubmit = event => {
    event.preventDefault();
    setClientName(nameInputValue);
    _handleRequests("register");
  }

  const _handleCanel = () => {
    _handleRequests("remove");
  }

  const Status = () => {
    let statusText = "";
    switch(accessPermission) {
      case undefined:
        statusText = "Loading..."
        break;
      case 2:
        statusText = "You are Next!";
        break;
      case 3:
        statusText = "You are 2nd in line";
        break;
      case 4:
        statusText = "You are 3rd in line";
        break;
      default:
        statusText = `You are ${accessPermission-1}th in line`;
    }
    return (
      <div className='introPageRoot status'>
        <h3>Thanks {clientName}, you successfuly joined the queue!</h3>
        <h3>{statusText}</h3>
        <h4>You can view other's experiments in the meantime</h4>
        <button onClick={_handleCanel}>Cancel Registeration</button>
      </div>
    )
  }

  const _getStatusContent = () => {
    switch(accessPermission) {
      case -1:
        return (<Error/>)
      case 0:
        return (
          <form onSubmit={_handleSubmit} className='introPageRoot register'>
            <label className='description inputLabel' htmlFor='nameInput'>Please enter your name:</label>
            <input
              className='nameInput'
              type="text"
              value={nameInputValue}
              onChange={_handleNameChange}
              id="nameInput"
            />
            <button type="submit" className='registerButton'>Register to experiment!</button>
          </form>
        );
        break;
      default:
        return (<Status/>);
    }
  }

  return _getStatusContent();
}

export default IntroPage;
