import React, { FC } from 'react';
import { HandlerPos } from './handler-pos';
import QuoteLeft from "./quote-left.svg";
import QuoteRight from "./quote-right.svg";
import './index.css';

export const SelectionHandler: FC<{
  pos: HandlerPos | null;
  grab: boolean;
  setGrab: (value: boolean) => void;
  left: boolean;
}> = ({ pos, grab, setGrab, left }) => {
  return (
    pos &&
    <div
      draggable={false}
      className={`bg-yellow-300 opacity-80 ${left ? 'rounded-l-md' : 'rounded-r-md'}`}
      style={{
        position: 'absolute',
        display: 'flex',
        left: left ? pos.left - 24 : pos.left - 1,
        top: pos.top,
        width: '25px',
        height: pos.height,
        cursor: grab ? 'grabbing' : 'grab',
        alignItems: left ? 'flex-start' : 'flex-end',
      }}
      onMouseDown={() => {
        setGrab(true);
        const handler = () => {
          setGrab(false);
          document.removeEventListener('mouseup', handler);
        };
        document.addEventListener('mouseup', handler);
      }}
      onMouseUp={() => {
        setGrab(false);
      }}
    >
      {left
        ? <QuoteLeft />
        : <QuoteRight />}
    </div>
  );
};
