import React, { useRef } from "react";

function useThrottle(fn, delay) {
  const lastTime = useRef(Date.now());

  return (...args) => {
    const now = Date.now();
    console.log(now - lastTime.current, ...args);
    if (now - lastTime.current < delay) return;
    lastTime.current = now;
    fn(...args);
  };
}

export default useThrottle;
