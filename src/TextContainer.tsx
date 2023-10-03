import React, { ForwardRefRenderFunction } from 'react';

const _TextContainer: ForwardRefRenderFunction<HTMLDivElement, { children: React.ReactNode }> =
  ({ children }, ref) => {
    return (
      <div ref={ref} draggable={false} className="basis-80 w-80 bg-yellow-50 p-11 text-3xl select-none bg-transparent">
        {children}
      </div>
    );
  };


export const TextContainer = React.forwardRef(_TextContainer);
