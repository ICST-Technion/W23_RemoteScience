import React from 'react';

const Loading = ({message, className}) => {
  const [dotsNum, setDotsNum] = React.useState('...');
    
  const changeDotsNum = () => {
    switch(dotsNum){
      case ".":
        setDotsNum('..');
        break;
      case "..":
        setDotsNum('...');
        break;
      default:
        setDotsNum('.');
        break;
    }
  }

  React.useEffect(() => {
    let reload = setTimeout(()=> {
      setDotsNum(changeDotsNum)
    }, 500);
    return () => {
      clearTimeout(reload);
    }
  })
    
  return (
    <div className={className}>
      {message}{dotsNum}
    </div>
  );
}

export default Loading;
