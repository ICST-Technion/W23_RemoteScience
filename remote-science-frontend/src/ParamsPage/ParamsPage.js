import { useLayoutEffect, useState } from 'react';
//import './ParamsPage.css'

const IntroPage = ({ permission, setPermission }) => {

  const [angleInputValue, setAngleInputValue] = useState(10);
  const [lengthInputValue, setLengthInputValue] = useState(5);

  const _handleAngleChange = event => {
    setAngleInputValue(event.target.value);
  }

  const _handleLengthChange = event => {
    setLengthInputValue(event.target.value);
  }

  return (
    <form className="paramsPageRoot">
      <h2>please enter your paramters for the experiment:</h2>
      <label htmlFor="angleInput">Stick Angle: {angleInputValue}</label>
      <input
        className='angle'
        type="range"
        step={0.5}
        min={10}
        max={20}
        value={angleInputValue}
        onChange={_handleAngleChange}
        id="angleInput"
      />
      <label htmlFor="lengthInput">Stick length: {lengthInputValue}</label>
      <input
        className='stick'
        type="range"
        step={1}
        min={5}
        max={15}
        value={lengthInputValue}
        onChange={_handleLengthChange}
        id="lengthInput"
      />
      <button className='submitParams' type='submit'>Start Experiment</button>
    </form>
  );
}

export default IntroPage;
