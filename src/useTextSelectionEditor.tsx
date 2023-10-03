import React, { useEffect, useRef, useState } from 'react';
import { HandlerPos } from './handler-pos';

declare global {
  interface Document {
      caretPositionFromPoint: any;
  }
}

const getHandlerRect = (index: number, node: Node): DOMRect | null => {
  const range = document.createRange();
  range.setStart(node, index);
  range.setEnd(node, index);
  const rects = range.getClientRects();
  if (rects.length === 1) {
    return rects[0];
  }
  return null;
}

const getAllRects = (node: Node, start: number, end: number) => {
  const range = document.createRange();
  range.setStart(node, start);
  range.setEnd(node, end);
  return range.getClientRects();
}

interface NodeAndOffset {
  node: Node,
  offset: number,
}

const getNodeAndOffsetFromPoint = (x: number, y: number): NodeAndOffset | null => {
  let range: any;
  let textNode: any;
  let offset: any;

  if (document.caretPositionFromPoint) {
    range = document.caretPositionFromPoint(x, y);
    textNode = range.offsetNode;
    offset = range.offset;
  } else if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(x, y);
    textNode = range.startContainer;
    offset = range.startOffset;
  } else {
    return null;
  }

  if (textNode?.nodeType === document.TEXT_NODE) {
    if (!Number.isNaN(offset)) {
      return { node: textNode, offset };
    }
  }
  return null;
}

export const useTextSelectionEditor = (
  initLeftPos: number,
  initRightPos: number,
  leftDrag: boolean,
  rightDrag: boolean
): [
    React.MutableRefObject<HTMLDivElement | null>,
    HandlerPos | null,
    HandlerPos | null,
    DOMRectList | null] => {

  // left handler pos
  const [leftHandler, setLeftHandler] = useState<HandlerPos | null>(null);

  const [currentLeftPos, setCurrentLeftPos] = useState<number>(initLeftPos);

  // right handler pos
  const [rightHandler, setRightHandler] = useState<HandlerPos | null>(null);

  const [currentRightPos, setCurrentRightPos] = useState<number>(initRightPos);

  const [rects, setRects] = useState<DOMRectList | null>(null);

  // reference
  const textDiv = useRef<HTMLDivElement | null>(null);

  // mouse move handler

  // left handler

  useEffect(() => {
    const handlerMove = (e: MouseEvent) => {
      if (!leftDrag) return;
      const sm = getNodeAndOffsetFromPoint(e.clientX, e.clientY);
      if (
        sm
        && sm.node === textDiv.current?.childNodes[0]
        && sm.offset <= currentRightPos
      ) {
        setCurrentLeftPos(sm.offset);
      }
    };
    document.addEventListener('mousemove', handlerMove);
    return () => {
      document.removeEventListener('mousemove', handlerMove);
    };
  }, [leftDrag, currentRightPos]);

  useEffect(() => {
    setCurrentLeftPos(initLeftPos);
  }, [initLeftPos]);

  // right handler

  useEffect(() => {
    const handlerMove = (e: MouseEvent) => {
      if (!rightDrag) return;
      const sm = getNodeAndOffsetFromPoint(e.clientX, e.clientY);
      if (
        sm
        && sm.node === textDiv.current?.childNodes[0]
        && sm.offset >= currentLeftPos
      ) {
        setCurrentRightPos(sm.offset);
      }
    };
    document.addEventListener('mousemove', handlerMove);
    return () => {
      document.removeEventListener('mousemove', handlerMove);
    };
  }, [rightDrag, currentLeftPos]);

  useEffect(() => {
    setCurrentRightPos(initRightPos);
  }, [initRightPos]);

  // draw init left handler
  useEffect(() => {
    if (textDiv.current
      && textDiv.current.childNodes.length === 1
      && textDiv.current.childNodes[0].nodeType === document.TEXT_NODE) {
      const rect = getHandlerRect(currentLeftPos, textDiv.current.childNodes[0]);
      if (rect === null) {
        setLeftHandler(null);
        setRects(null);
      } else {
        setLeftHandler({
          height: rect.height,
          left: rect.left,
          top: rect.top,
        });
      }
    }

  }, [currentLeftPos]);

  // draw init right handler
  useEffect(() => {
    if (textDiv.current
      && textDiv.current.childNodes.length === 1
      && textDiv.current.childNodes[0].nodeType === document.TEXT_NODE) {
      const rect = getHandlerRect(currentRightPos, textDiv.current.childNodes[0]);
      if (rect === null) {
        setRightHandler(null);
        setRects(null);
      } else {
        setRightHandler({
          height: rect.height,
          left: rect.left,
          top: rect.top,
        });
      }
    }

  }, [currentRightPos]);

  useEffect(() => {
    const n = textDiv.current?.childNodes[0];
    if (n) setRects(getAllRects(n, currentLeftPos, currentRightPos));
  }, [currentLeftPos, currentRightPos])

  // return
  return [textDiv, leftHandler, rightHandler, rects];
};
