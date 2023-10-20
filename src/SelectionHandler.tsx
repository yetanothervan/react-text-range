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
  width?: number;
  className?: string,
}> = ({ pos, grab, setGrab, left, width, className }) => {
  const widthDef = width ?? 25;
  return (
    pos &&
    <div
      draggable={false}
      className={`${left ? 'rounded-l-md' : 'rounded-r-md'} ${className}`}
      style={{
        position: 'absolute',
        display: 'flex',
        left: left ? pos.left - (widthDef - 1) : pos.left - 1,
        top: pos.top,
        width: `${widthDef}px`,
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
