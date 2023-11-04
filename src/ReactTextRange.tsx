import { FC, useEffect, useState } from 'react';
import { useTextSelectionEditor } from './useTextSelectionEditor';
import { SelectionHandler } from './SelectionHandler';
import React from 'react';

export type TextContainer = React.ForwardRefExoticComponent<{
  children: React.ReactNode;
} & React.RefAttributes<HTMLDivElement>>;

export interface RangeState {
  left: number,
  right: number,
}

export const ReactTextRange: FC<{
  text: string;
  initLeftPos: number;
  initRightPos: number,
  Container: TextContainer,
  onChange: (state: RangeState) => void,
  props?: React.CSSProperties,
  className?: string,
  handlerWidth?: number,
  leftHandlerClass?: string,
  rightHandlerClass?: string,
  headClass?: string,
  selectionClass?: string,
  tailClass?: string,
}> = ({
  initLeftPos,
  initRightPos,
  Container,
  text,
  onChange,
  props,
  handlerWidth,
  className,
  leftHandlerClass,
  rightHandlerClass,
  headClass,
  selectionClass,
  tailClass,
}) => {

    const [mouseOnLeft, setMouseOnLeft] = useState<boolean>(false);

    const [mouseOnRight, setMouseOnRight] = useState<boolean>(false);

    const [textDiv, leftHandler, rightHandler] =
      useTextSelectionEditor(text, initLeftPos, initRightPos, mouseOnLeft, mouseOnRight, headClass, selectionClass, tailClass);

    useEffect(() => {
      if (leftHandler && rightHandler) {
        onChange({
          left: leftHandler.pos,
          right: rightHandler.pos,
        })
      }
    }, [leftHandler, rightHandler]);

    return (
      <div
        className={className}
        draggable={false}
        style={{
          position: 'relative',
          ...props
        }}
      >
        <Container ref={textDiv}>{text}</Container>
        <SelectionHandler className={leftHandlerClass} width={handlerWidth} grab={mouseOnLeft} left={true} pos={leftHandler} setGrab={(v) => setMouseOnLeft(v)} />
        <SelectionHandler className={rightHandlerClass} width={handlerWidth} grab={mouseOnRight} left={false} pos={rightHandler} setGrab={(v) => setMouseOnRight(v)} />
      </div>
    );
  };

export default ReactTextRange;
