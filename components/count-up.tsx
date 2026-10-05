"use client";

import { useState, useEffect } from "react";

export function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }
    const step = Math.max(1, target / 60);
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev + step >= target) {
          clearInterval(timer);
          return target;
        }
        return Math.floor(prev + step);
      });
    }, 16);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}
