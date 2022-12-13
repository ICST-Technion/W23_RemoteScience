import { useLayoutEffect, useState } from 'react';
//import './IntroPage.css'

const IntroPage = ({ permission, setPermission }) => {
  const Error = () => (
    <div className='error'>
      <h2>Sorry, an error occured :(</h2>
      <h2>Please try again later!</h2>
    </div>
  )

  const handleRegister = () => {

  }
 
  const getContent = () => {
    switch(permission) {
      case -1:
        return (<Error/>)
      case 0:
        return (<button onClick={handleRegister} className='registerButton'>Register to experiment!</button>);
        break;
      case 2:
        return (<h3>You are Next!</h3>);
        break;
      case 3:
        return (<h3>You are 2nd in line :)</h3>);
        break;
      case 4:
        return (<h3>You are 3rd in line :)</h3>);
        break;
      default:
        return (<h3>You are {permission}th in line :)</h3>);
    }
  }

  return (
    <div className="introPageRoot">
      {getContent()}
    </div>
  );
}

export default IntroPage;
