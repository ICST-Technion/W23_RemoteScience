import { useLayoutEffect, useState } from 'react';
import './IntroPage.css'

const IntroPage = ({
  accessPermission,
  setAccessPermission,
  clientName,
  setClientName,
  clientID,
  setClientID
}) => {
  const [nameInputValue, setNameInputValue] = useState("");

  const _handleAccessPermissionStatus = requestType => {
    /** I assume that our request is in http and is in the form:
     * http://our_amazon_server/accessPermission/clientName - for a request to join the queue
     * http://our_amazon_server/accessPermissionStatus/clientID - for a request to see the status in the queue
     * TODO: change the format after we create the server
     */
    fetch(`http://our_amazon_server/${requestType}/${requestType === "accessPermissionStatus" ? clientID : clientName}`)
      .then((response)=>{
        if (response.status !== 200) {
            setAccessPermission(-1);
            return;
        }
        response.json().then((data)=>{ 
            if(data && data.accessPermission){
              const currentAccessPermission = data.accessPermission;
              if(requestType === "accessPermission" && data.clientID) {
                const currentClientID = data.clientID;
                setClientID(currentClientID);
              }
              setAccessPermission(currentAccessPermission);
            }
      });})
      .catch(()=>{
        setAccessPermission(-1);
        return;
      });
  }

  /*useLayoutEffect(() => {
    /** if accessPermission > 1, meaning a request to join the queue has been done
     * and it's not the current client's turn yet, we sent a request every second
     * to find our status on the queue and update the UI accordingly
     * */
  /*  if(accessPermission>1){
      let reload = setTimeout(()=> {
        setAccessPermission(_handleAccessPermissionStatus("accessPermissionStatus"))
      }, 1000);
      return () => {
        clearTimeout(reload);
      }
    }
  }, []);*/

  const Error = () => (
    <div className='introPageRoot error'>
      <h2>Sorry, an error occured :(</h2>
      <h2>Please try again later!</h2>
    </div>
  )

  const _handleNameChange = event => {
    setNameInputValue(event.target.value);
  }

  const _handleSubmit = () => {
    setClientName(nameInputValue);
    //_handleAccessPermissionStatus("accessPermission");
  }

  const Status = () => {
    let statusText = "";
    switch(accessPermission) {
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
            <label htmlFor='nameInput'>Please enter your name:</label>
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
