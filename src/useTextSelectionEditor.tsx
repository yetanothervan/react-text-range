import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { HandlerPos } from './handler-pos';

// Fix 11: proper typing for caretPositionFromPoint (CSSOM View spec)
interface CaretPosition {
  readonly offsetNode: Node;
  readonly offset: number;
  getClientRect(): DOMRect | null;
}

declare global {
  interface Document {
    caretPositionFromPoint(x: number, y: number): CaretPosition | null;
  }
}

// Fix 9: named constants for DOM child node structure
// After surroundContents: [text][span:head][text][span:selection][text][span:tail]
const EXPECTED_CHILD_COUNT = 6;
const NODE = { HEAD: 1, SEL: 3, TAIL: 5 } as const;

// Fix 2: position clamping utility
const clampPositions = (left: number, right: number, textLen: number): [number, number] => {
  const clampedLeft = Math.max(0, Math.min(left, textLen));
  const clampedRight = Math.max(clampedLeft, Math.min(right, textLen));
  return [clampedLeft, clampedRight];
};

// Fix 8: shallow equality for HandlerPos to avoid unnecessary re-renders
const handlerPosEqual = (a: HandlerPos | null, b: HandlerPos | null): boolean => {
  if (a === b) return true;
  if (a === null || b === null) return false;
  return a.height === b.height && a.left === b.left && a.top === b.top && a.pos === b.pos;
};

const getHandlerRect = (node: Node, left: boolean): DOMRect | null => {
  if (!node || !node.childNodes || node.childNodes.length !== EXPECTED_CHILD_COUNT) return null;

  const headLength = node.childNodes[NODE.HEAD].firstChild?.nodeValue?.length ?? 0;
  const selLength = node.childNodes[NODE.SEL].firstChild?.nodeValue?.length ?? 0;
  const tailLength = node.childNodes[NODE.TAIL].firstChild?.nodeValue?.length ?? 0;

  if (left) {
    const range = document.createRange();
    if (selLength > 0) {
      range.selectNodeContents(node.childNodes[NODE.SEL]);
    } else if (tailLength > 0) {
      range.selectNodeContents(node.childNodes[NODE.TAIL]);
    } else {
      range.setStart(node.childNodes[NODE.HEAD].childNodes[0], headLength);
      range.setEnd(node.childNodes[NODE.HEAD].childNodes[0], headLength);
    }
    if (range.getClientRects) {
      const rects = range.getClientRects();
      if (rects.length >= 1) {
        return rects[0];
      }
    }
    return null;

  } else {
    const range = document.createRange();
    if (tailLength > 0) {
      range.selectNodeContents(node.childNodes[NODE.TAIL]);
    } else if (selLength > 0) {
      range.setStart(node.childNodes[NODE.SEL].childNodes[0], selLength);
      range.setEnd(node.childNodes[NODE.SEL].childNodes[0], selLength);
    } else {
      range.setStart(node.childNodes[NODE.HEAD].childNodes[0], headLength);
      range.setEnd(node.childNodes[NODE.HEAD].childNodes[0], headLength);
    }

    if (range.getClientRects) {
      const rects = range.getClientRects();
      if (rects.length >= 1) {
        return rects[0];
      }
    }
    return null;
  }
}

interface NodeAndOffset {
  node: Node,
  offset: number,
}

const createTextNodes = (div: HTMLDivElement): void => {
  if (div.childNodes[NODE.HEAD] && !div.childNodes[NODE.HEAD].firstChild) {
    div.childNodes[NODE.HEAD].appendChild(document.createTextNode(''));
  }
  if (div.childNodes[NODE.SEL] && !div.childNodes[NODE.SEL].firstChild) {
    div.childNodes[NODE.SEL].appendChild(document.createTextNode(''));
  }
  if (div.childNodes[NODE.TAIL] && !div.childNodes[NODE.TAIL].firstChild) {
    div.childNodes[NODE.TAIL].appendChild(document.createTextNode(''));
  }
}

// Fix 11: proper types, null check on caretPositionFromPoint result
const getNodeAndOffsetFromPoint = (x: number, y: number): NodeAndOffset | null => {
  if (document.caretPositionFromPoint) {
    const caretPos = document.caretPositionFromPoint(x, y);
    if (!caretPos) return null;
    if (caretPos.offsetNode?.nodeType === document.TEXT_NODE && !Number.isNaN(caretPos.offset)) {
      return { node: caretPos.offsetNode, offset: caretPos.offset };
    }
    return null;
  } else if (document.caretRangeFromPoint) {
    const range = document.caretRangeFromPoint(x, y);
    if (range && range.startContainer?.nodeType === document.TEXT_NODE && !Number.isNaN(range.startOffset)) {
      return { node: range.startContainer, offset: range.startOffset };
    }
    return null;
  }
  return null;
}

export const useTextSelectionEditor = (
  text: string,
  initLeftPos: number,
  initRightPos: number,
  leftDrag: boolean,
  rightDrag: boolean,
  headClass?: string,
  selectionClass?: string,
  tailClass?: string,
): [
    React.MutableRefObject<HTMLDivElement | null>,
    HandlerPos | null,
    HandlerPos | null] => {

  // Fix 10: SSR guard — useLayoutEffect won't run on server,
  // but we still return safe defaults at the bottom
  const isSSR = typeof document === 'undefined';

  // left handler pos
  const [leftHandler, setLeftHandler] = useState<HandlerPos | null>(null);

  // Fix 2: clamp initial values
  const [currentLeftPos, setCurrentLeftPos] = useState<number>(() => {
    const [cl] = clampPositions(initLeftPos, initRightPos, text.length);
    return cl;
  });

  // right handler pos
  const [rightHandler, setRightHandler] = useState<HandlerPos | null>(null);

  const [currentRightPos, setCurrentRightPos] = useState<number>(() => {
    const [, cr] = clampPositions(initLeftPos, initRightPos, text.length);
    return cr;
  });

  // reference
  const textDiv = useRef<HTMLDivElement | null>(null);

  // Fix 6: empty deps — ref is set after first render, useLayoutEffect runs after that
  useLayoutEffect(() => {
    if (textDiv.current) {
      textDiv.current.style.position = 'relative';
    }
  }, []);

  // Break text into three spans
  // Fix 1: depend on props (initLeftPos/initRightPos) so DOM rebuilds when props change
  // Fix 2: clamp positions before Range operations
  useLayoutEffect(() => {
    if (isSSR) return;
    if (!textDiv.current) return;

    const [clampedLeft, clampedRight] = clampPositions(initLeftPos, initRightPos, text.length);

    // Sync internal state to clamped prop values
    setCurrentLeftPos(clampedLeft);
    setCurrentRightPos(clampedRight);

    // remove all nodes
    while (textDiv.current.childNodes.length > 0 && textDiv.current.lastChild) {
      textDiv.current.removeChild(textDiv.current.lastChild);
    }

    const textNode = document.createTextNode(text);
    textDiv.current.appendChild(textNode);

    let textLeftNode = textDiv.current?.childNodes[0];
    if (!textLeftNode || textLeftNode.nodeType !== document.TEXT_NODE || textLeftNode.nodeValue === null) {
      return;
    }

    const head = document.createRange();
    head.setStart(textLeftNode, 0);
    head.setEnd(textLeftNode, clampedLeft);
    const headSpan = document.createElement('span');
    if (headClass) headSpan.classList.value = headClass;
    head.surroundContents(headSpan);

    textLeftNode = textDiv.current?.childNodes[2];
    if (!textLeftNode
      || !textLeftNode.nodeValue
      || textLeftNode.nodeValue.length < clampedRight - clampedLeft) return;

    const selection = document.createRange();
    selection.setStart(textLeftNode, 0);
    selection.setEnd(textLeftNode, clampedRight - clampedLeft);
    const selectionSpan = document.createElement('span');
    if (selectionClass) selectionSpan.classList.value = selectionClass;
    selection.surroundContents(selectionSpan);

    textLeftNode = textDiv.current?.childNodes[4];
    if (!textLeftNode) return;
    const tail = document.createRange();
    tail.setStart(textLeftNode, 0);
    tail.setEndAfter(textLeftNode);
    const tailSpan = document.createElement('span');
    if (tailClass) tailSpan.classList.value = tailClass;
    tail.surroundContents(tailSpan);

    return () => {
      if (textDiv.current && textDiv.current.childNodes[0]) {
        while (textDiv.current.childNodes.length > 0 && textDiv.current.lastChild) {
          textDiv.current.removeChild(textDiv.current.lastChild);
        }
      }
    }
  }, [text, initLeftPos, initRightPos, headClass, selectionClass, tailClass]);

  // left handler drag

  // Fix 4: null checks instead of non-null assertions
  // Fix 6: remove textDiv.current from deps
  const leftMoveHandler = useCallback((e: MouseEvent) => {
    const sm = getNodeAndOffsetFromPoint(e.clientX, e.clientY);
    if (!sm) return;
    if (!textDiv.current) return;
    if (textDiv.current.childNodes.length !== EXPECTED_CHILD_COUNT) return;

    let posToSet = currentLeftPos;
    if (sm.node === textDiv.current.childNodes[NODE.HEAD].firstChild) {
      posToSet = sm.offset;
    } else if (sm.node === textDiv.current.childNodes[NODE.SEL].firstChild) {
      posToSet = currentLeftPos + sm.offset;
    }

    // Fix 2: clamp left pos to [0, currentRightPos]
    posToSet = Math.max(0, Math.min(posToSet, currentRightPos));

    if (posToSet !== currentLeftPos) {

      createTextNodes(textDiv.current);

      // Fix 4: null checks
      const headTextNode = textDiv.current.childNodes[NODE.HEAD]?.firstChild;
      const selTextNode = textDiv.current.childNodes[NODE.SEL]?.firstChild;
      if (!headTextNode || !selTextNode
          || headTextNode.nodeValue === null || selTextNode.nodeValue === null) {
        return;
      }

      const full = headTextNode.nodeValue + selTextNode.nodeValue;
      headTextNode.nodeValue = full.substring(0, posToSet);
      selTextNode.nodeValue = full.substring(posToSet);

      setCurrentLeftPos(posToSet);
    }
  }, [currentLeftPos, currentRightPos, text]);

  // Fix 6: depend on leftMoveHandler identity (which changes when its deps change)
  useLayoutEffect(() => {
    if (!leftDrag) {
      document.removeEventListener('mousemove', leftMoveHandler);
    } else {
      document.addEventListener('mousemove', leftMoveHandler);
    }
    return () => {
      document.removeEventListener('mousemove', leftMoveHandler);
    };
  }, [leftDrag, leftMoveHandler]);

  // right handler drag

  // Fix 4: null checks instead of non-null assertions
  // Fix 6: remove textDiv.current from deps
  const rightMoveHandler = useCallback((e: MouseEvent) => {
    const sm = getNodeAndOffsetFromPoint(e.clientX, e.clientY);
    if (!sm) return;
    if (!textDiv.current) return;
    if (textDiv.current.childNodes.length !== EXPECTED_CHILD_COUNT) return;

    let posToSet = currentRightPos;
    if (sm.node === textDiv.current.childNodes[NODE.SEL].firstChild) {
      posToSet = currentLeftPos + sm.offset;
    } else if (sm.node === textDiv.current.childNodes[NODE.TAIL].firstChild) {
      posToSet = currentRightPos + sm.offset;
    }

    // Fix 2: clamp right pos to [currentLeftPos, text.length]
    posToSet = Math.max(currentLeftPos, Math.min(posToSet, text.length));

    if (posToSet !== currentRightPos) {

      createTextNodes(textDiv.current);

      // Fix 4: null checks
      const selTextNode = textDiv.current.childNodes[NODE.SEL]?.firstChild;
      const tailTextNode = textDiv.current.childNodes[NODE.TAIL]?.firstChild;
      if (!selTextNode || !tailTextNode
          || selTextNode.nodeValue === null || tailTextNode.nodeValue === null) {
        return;
      }

      const full = selTextNode.nodeValue + tailTextNode.nodeValue;
      selTextNode.nodeValue = full.substring(0, posToSet - currentLeftPos);
      tailTextNode.nodeValue = full.substring(posToSet - currentLeftPos);

      setCurrentRightPos(posToSet);
    }
  }, [currentLeftPos, currentRightPos, text]);

  // Fix 6: depend on rightMoveHandler identity
  useLayoutEffect(() => {
    if (!rightDrag) {
      document.removeEventListener('mousemove', rightMoveHandler);
    } else {
      document.addEventListener('mousemove', rightMoveHandler);
    }
    return () => {
      document.removeEventListener('mousemove', rightMoveHandler);
    };
  }, [rightDrag, rightMoveHandler]);

  // draw left handler position
  // Fix 8: shallow equality check before setting state
  useLayoutEffect(() => {
    if (textDiv.current
      && textDiv.current.childNodes.length === EXPECTED_CHILD_COUNT) {
      const rect = getHandlerRect(textDiv.current, true);
      if (rect === null) {
        setLeftHandler(prev => prev === null ? prev : null);
      } else {
        const divRect = textDiv.current.getBoundingClientRect();
        const newPos: HandlerPos = {
          height: rect.height,
          left: rect.left - divRect.left,
          top: rect.top - divRect.top,
          pos: currentLeftPos,
        };
        setLeftHandler(prev => handlerPosEqual(prev, newPos) ? prev : newPos);
      }
    }

  }, [currentLeftPos]);

  // draw right handler position
  // Fix 8: shallow equality check before setting state
  useLayoutEffect(() => {
    if (textDiv.current
      && textDiv.current.childNodes.length === EXPECTED_CHILD_COUNT) {
      const rect = getHandlerRect(textDiv.current, false);
      if (rect === null) {
        setRightHandler(prev => prev === null ? prev : null);
      } else {
        const divRect = textDiv.current.getBoundingClientRect();
        const newPos: HandlerPos = {
          height: rect.height,
          left: rect.left - divRect.left,
          top: rect.top - divRect.top,
          pos: currentRightPos,
        };
        setRightHandler(prev => handlerPosEqual(prev, newPos) ? prev : newPos);
      }
    }

  }, [currentRightPos]);

  // Fix 10: return safe defaults for SSR
  if (isSSR) {
    return [textDiv, null, null];
  }

  return [textDiv, leftHandler, rightHandler];
};
