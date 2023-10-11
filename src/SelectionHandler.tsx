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
  bgColor?: string;
  width?: number;
}> = ({ pos, grab, setGrab, left, bgColor, width }) => {
  const bgColorDef = bgColor ?? 'rgb(253 224 71)';
  const widthDef = width ?? 25;
  return (
    pos &&
    <div
      draggable={false}
      className={`${left ? 'rounded-l-md' : 'rounded-r-md'}`}
      style={{
        position: 'absolute',
        display: 'flex',
        left: left ? pos.left - (widthDef - 1) : pos.left - 1,
        top: pos.top,
        width: `${widthDef}px`,
        height: pos.height,
        cursor: grab ? 'grabbing' : 'grab',
        alignItems: left ? 'flex-start' : 'flex-end',
        backgroundColor: bgColorDef,
        opacity: .8,
        // transform: 'scale(.5)'
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
