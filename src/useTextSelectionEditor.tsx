import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { HandlerPos } from './handler-pos';

declare global {
  interface Document {
    caretPositionFromPoint: any;
  }
}

const getHandlerRect = (node: Node, left: boolean): DOMRect | null => {
  if (!node || !node.childNodes || node.childNodes.length != 6) return null;

  const headLength = node.childNodes[1].firstChild?.nodeValue?.length ?? 0;
  const selLength = node.childNodes[3].firstChild?.nodeValue?.length ?? 0;
  const tailLength = node.childNodes[5].firstChild?.nodeValue?.length ?? 0;

  if (left) {
    const range = document.createRange();
    if (selLength > 0) {
      range.selectNodeContents(node.childNodes[3]);
    } else if (tailLength > 0) {
      range.selectNodeContents(node.childNodes[5]);
    } else {
      range.setStart(node.childNodes[1].childNodes[0], headLength);
      range.setEnd(node.childNodes[1].childNodes[0], headLength);
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
      range.selectNodeContents(node.childNodes[5]);
    } else if (selLength > 0) {
      range.setStart(node.childNodes[3].childNodes[0], selLength);
      range.setEnd(node.childNodes[3].childNodes[0], selLength);
    } else {
      range.setStart(node.childNodes[1].childNodes[0], headLength);
      range.setEnd(node.childNodes[1].childNodes[0], headLength);
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
  if (div.childNodes[1] && !div.childNodes[1].firstChild) {
    div.childNodes[1].appendChild(document.createTextNode(''));
  }
  if (div.childNodes[3] && !div.childNodes[3].firstChild) {
    div.childNodes[3].appendChild(document.createTextNode(''));
  }
  if (div.childNodes[5] && !div.childNodes[5].firstChild) {
    div.childNodes[5].appendChild(document.createTextNode(''));
  }
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
    if (range) {
      textNode = range.startContainer;
      offset = range.startOffset;
    }
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
  rightDrag: boolean,
  headClass?: string,
  selectionClass?: string,
  tailClass?: string,
): [
    React.MutableRefObject<HTMLDivElement | null>,
    HandlerPos | null,
    HandlerPos | null] => {

  // left handler pos
  const [leftHandler, setLeftHandler] = useState<HandlerPos | null>(null);

  const [currentLeftPos, setCurrentLeftPos] = useState<number>(initLeftPos);

  // right handler pos
  const [rightHandler, setRightHandler] = useState<HandlerPos | null>(null);

  const [currentRightPos, setCurrentRightPos] = useState<number>(initRightPos);

  // reference
  const textDiv = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (textDiv.current) {
      textDiv.current.style.position = 'relative';
    }
  }, [textDiv])

  // break text into three spans
  useLayoutEffect(() => {
    let textLeftNode = textDiv.current?.childNodes[0];
    if (!textLeftNode || textLeftNode.nodeType !== document.TEXT_NODE || textLeftNode.nodeValue === null) {
      return;
    }

    const head = document.createRange();
    head.setStart(textLeftNode, 0);
    head.setEnd(textLeftNode, currentLeftPos);
    const headSpan = document.createElement('span');
    if (headClass) headSpan.classList.value = headClass;
    head.surroundContents(headSpan);

    textLeftNode = textDiv.current?.childNodes[2];
    if (!textLeftNode
      || !textLeftNode.nodeValue
      || textLeftNode.nodeValue.length < currentRightPos - currentLeftPos) return;

    const selection = document.createRange();
    selection.setStart(textLeftNode, 0);
    selection.setEnd(textLeftNode, currentRightPos - currentLeftPos);
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
        textDiv.current.childNodes[0].nodeValue = textDiv.current.textContent;
        while (textDiv.current.childNodes.length > 1 && textDiv.current.lastChild) {
          textDiv.current.removeChild(textDiv.current.lastChild);
        }
      }
    }
  }, [textDiv.current]);

  // mouse move handler

  // left handler

  const leftMoveHandler = useCallback((e: MouseEvent) => {
    const sm = getNodeAndOffsetFromPoint(e.clientX, e.clientY);
    if (!sm) return;
    if (!textDiv.current) return;

    let posToSet = currentLeftPos;
    if (sm.node === textDiv.current.childNodes[1].firstChild) {
      posToSet = sm.offset;
    } else if (sm.node === textDiv.current.childNodes[3].firstChild) {
      posToSet = currentLeftPos + sm.offset;
    }

    if (posToSet !== currentLeftPos) {

      createTextNodes(textDiv.current);

      const headText = textDiv.current.childNodes[1]!.firstChild!.nodeValue!;
      const selText = textDiv.current.childNodes[3]!.firstChild!.nodeValue!;
      const full = headText + selText;

      const nodeChild1 = textDiv.current.childNodes[1].firstChild!;
      nodeChild1.nodeValue = full.substring(0, posToSet);

      const nodeChild3 = textDiv.current.childNodes[3].firstChild!;
      nodeChild3.nodeValue = full.substring(posToSet);


      setCurrentLeftPos(posToSet);
    }
  }, [currentLeftPos, textDiv.current]);

  useLayoutEffect(() => {
    if (!leftDrag) {
      document.removeEventListener('mousemove', leftMoveHandler);
    } else {
      document.addEventListener('mousemove', leftMoveHandler);
    }
    return () => {
      document.removeEventListener('mousemove', leftMoveHandler);
    };
  }, [leftDrag, currentLeftPos, textDiv.current]);

  useLayoutEffect(() => {
    setCurrentLeftPos(initLeftPos);
  }, [initLeftPos]);

  // right handler

  const rightMoveHandler = useCallback((e: MouseEvent) => {
    const sm = getNodeAndOffsetFromPoint(e.clientX, e.clientY);
    if (!sm) return;
    if (!textDiv.current) return;

    let posToSet = currentRightPos;
    if (sm.node === textDiv.current?.childNodes[3].firstChild) {
      posToSet = currentLeftPos + sm.offset;
    } else if (sm.node === textDiv.current?.childNodes[5].firstChild) {
      posToSet = currentRightPos + sm.offset;
    }
    if (posToSet !== currentRightPos) {

      createTextNodes(textDiv.current);

      const selText = textDiv.current.childNodes[3].firstChild!.nodeValue!;
      const tailText = textDiv.current.childNodes[5].firstChild!.nodeValue!;
      const full = selText + tailText;

      const nodeChild3 = textDiv.current.childNodes[3].firstChild!;
      nodeChild3.nodeValue = full.substring(0, posToSet - currentLeftPos);

      const nodeChild5 = textDiv.current.childNodes[5].firstChild!;
      nodeChild5.nodeValue = full.substring(posToSet - currentLeftPos);

      setCurrentRightPos(posToSet);
    }
  }, [currentLeftPos, currentRightPos, textDiv.current]);

  useLayoutEffect(() => {
    if (!rightDrag) {
      document.removeEventListener('mousemove', rightMoveHandler);
    } else {
      document.addEventListener('mousemove', rightMoveHandler);
    }
    return () => {
      document.removeEventListener('mousemove', rightMoveHandler);
    };
  }, [rightDrag, currentLeftPos, currentRightPos, textDiv.current]);

  useLayoutEffect(() => {
    setCurrentRightPos(initRightPos);
  }, [initRightPos]);

  // draw init left handler
  useLayoutEffect(() => {
    if (textDiv.current
      && textDiv.current.childNodes.length === 6) {
      const rect = getHandlerRect(textDiv.current, true);
      if (rect === null) {
        setLeftHandler(null);
      } else {
        const divRect = textDiv.current.getBoundingClientRect();
        setLeftHandler({
          height: rect.height,
          left: rect.left - divRect.left,
          top: rect.top - divRect.top,
          pos: currentLeftPos,
        });
      }
    }

  }, [currentLeftPos]);

  // draw init right handler
  useLayoutEffect(() => {
    if (textDiv.current
      && textDiv.current.childNodes.length === 6) {
      const rect = getHandlerRect(textDiv.current, false);
      if (rect === null) {
        setRightHandler(null);
      } else {
        const divRect = textDiv.current.getBoundingClientRect();
        setRightHandler({
          height: rect.height,
          left: rect.left - divRect.left,
          top: rect.top - divRect.top,
          pos: currentRightPos,
        });
      }
    }

  }, [currentRightPos]);

  // return
  return [textDiv, leftHandler, rightHandler];
};
