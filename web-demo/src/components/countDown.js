import React, { useState, useEffect } from 'react';

const Countdown = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  return (
    <span className="countdown font-mono text-2xl">
      <span style={{ "--value": hours }}></span>:
      <span style={{ "--value": minutes }}></span>:
      <span style={{ "--value": seconds }}></span>
    </span>
  );
};

export default Countdown;
