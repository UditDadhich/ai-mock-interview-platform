import React from 'react';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function Timer({ timeLeft, totalTime }) {
  const percentage = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-20 h-20 overflow-hidden"> {/* Added overflow-hidden */}
      <CircularProgressbar
        value={percentage}
        text={formatTime(timeLeft)}
        styles={buildStyles({
          textSize: '20px',
          pathColor: '#10b981',
          textColor: '#ef4444',
          trailColor: '#e5e7eb',
          // Force the SVG to fit its container
          width: '100%',
          height: '100%',
        })}
        // Alternative: override SVG class to ensure responsiveness
        className="w-full h-full"
      />
    </div>
  );
}

export default Timer;