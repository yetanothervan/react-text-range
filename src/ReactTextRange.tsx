import { FC, useEffect, useState } from 'react';
import { useTextSelectionEditor } from './useTextSelectionEditor';
import { SelectionHandler } from './SelectionHandler';
import React from 'react';
import { Rect } from './rect';

export type TextContainer = React.ForwardRefExoticComponent<{
  children: React.ReactNode;
} & React.RefAttributes<HTMLDivElement>>;

export interface RangeState {
  left: number,
  right: number,
}

export const ReactTextRange: FC<{
  initLeftPos: number;
  initRightPos: number,
  Container: TextContainer,
  children: string,
  onChange: (state: RangeState) => void,
  props?: React.CSSProperties,
  className?: string,
  selectionColor?: string,
  handlerWidth?: number,
}> = ({
  initLeftPos,
  initRightPos,
  Container,
  children,
  onChange,
  props,
  selectionColor,
  handlerWidth,
  className,
}) => {

    const [mouseOnLeft, setMouseOnLeft] = useState<boolean>(false);

    const [mouseOnRight, setMouseOnRight] = useState<boolean>(false);

    const [textDiv, leftHandler, rightHandler, rects] = useTextSelectionEditor(initLeftPos, initRightPos, mouseOnLeft, mouseOnRight);

    useEffect(() => {
      if (leftHandler && rightHandler) {
        onChange({
          left: leftHandler.pos,
          right: rightHandler.pos,
        })
      }
    }, [leftHandler, rightHandler]);

    const bgColor = selectionColor;

    return (
      <div
        className={className}
        draggable={false}
        style={{
          position: 'relative',
          ...props
        }}
      >
        <SelectionRects rects={rects} bgColor={bgColor} />
        <Container ref={textDiv}>
          {children}
        </Container>
        <SelectionHandler bgColor={bgColor} width={handlerWidth} grab={mouseOnLeft} left={true} pos={leftHandler} setGrab={(v) => setMouseOnLeft(v)} />
        <SelectionHandler bgColor={bgColor} width={handlerWidth} grab={mouseOnRight} left={false} pos={rightHandler} setGrab={(v) => setMouseOnRight(v)} />
      </div>
    );
  };

const SelectionRects: FC<{ rects: Rect[] | null, bgColor?: string }> = ({ rects, bgColor }) => {

  if (!rects) return null;
  return (
    <>
      {rects.map((d, i) => <SelectionRect key={i} rect={d} bgColor={bgColor} />)}
    </>
  )
}

const SelectionRect: FC<{ rect: Rect, bgColor?: string }> = ({ rect, bgColor }) => {
  const bgColorDef = bgColor ?? 'rgb(253 224 71)';
  return (
    <div style={{
      userSelect: 'none',
      position: 'absolute',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      backgroundColor: bgColorDef,
    }}>&nbsp;</div>
  )
}

export default ReactTextRange;