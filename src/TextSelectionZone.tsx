import { FC, useState } from 'react';
import { TextContainer } from './TextContainer';
import { useTextSelectionEditor } from './useTextSelectionEditor';
import { SelectionHandler } from './SelectionHandler';
import React from 'react';

export const TextSelectionZone: FC<{ initLeftPos: number; initRightPos: number, children: string }> = ({
  initLeftPos,
  initRightPos,
  children,
}) => {

  const [mouseOnLeft, setMouseOnLeft] = useState<boolean>(false);

  const [mouseOnRight, setMouseOnRight] = useState<boolean>(false);

  const [textDiv, leftHandler, rightHandler, rects] = useTextSelectionEditor(initLeftPos, initRightPos, mouseOnLeft, mouseOnRight);

  let divs: DOMRect[] = [];

  if (rects) {
    for (let i = 0; i < rects.length; ++i) {
      const aa = rects.item(i);
      if (aa) divs.push(aa);
    }
  }

  return (
    <div
      draggable={false}
      style={{
        display: 'flex',
      }}
    >
      {divs.map((d, i) => <div key={i} className='bg-yellow-300' style={{
        userSelect: 'none',
        position: 'absolute',
        top: `${d.top}px`,
        left: `${d.left}px`,
        width: `${d.width}px`,
        height: `${d.height}px`,
        zIndex: -2,
      }}>&nbsp;</div>)}
      <SelectionHandler grab={mouseOnLeft} left={true} pos={leftHandler} setGrab={(v) => setMouseOnLeft(v)} />
      <TextContainer ref={textDiv}>
        {children}
      </TextContainer>
      <SelectionHandler grab={mouseOnRight} left={false} pos={rightHandler} setGrab={(v) => setMouseOnRight(v)} />
    </div>
  );
};

export default TextSelectionZone;