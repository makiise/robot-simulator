import React from 'react';

const icons = ['robot.png', 'bomb.png', 'trash.png'];

const getRandomPosition = () => ({
  top: `${Math.floor(Math.random() * 90)}%`,
  left: `${Math.floor(Math.random() * 90)}%`,
  rotate: `${Math.floor(Math.random() * 360)}deg`,
  size: `${30 + Math.random() * 40}px`,
});

const BackgroundIcons: React.FC = () => {
  const scatteredIcons = Array.from({ length: 15 }, (_, i) => {
    const { top, left, rotate, size } = getRandomPosition();
    const icon = icons[Math.floor(Math.random() * icons.length)];
    return (
      <img
        key={i}
        src={`/${icon}`}
        alt=""
        style={{
          position: 'absolute',
          top,
          left,
          width: size,
          height: size,
          transform: `rotate(${rotate})`,
          opacity: 0.3,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
    );
  });

  return <>{scatteredIcons}</>;
};

export default BackgroundIcons;
