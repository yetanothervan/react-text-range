'use strict';

var React = require('react');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var React__namespace = /*#__PURE__*/_interopNamespaceDefault(React);

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = "@tailwind base;@tailwind components;@tailwind utilities;";
styleInject(css_248z,{"insertAt":"top"});

const fullWindow = {
    height: '100vh',
    widows: '100%',
};
const centroContainer = Object.assign(Object.assign({}, fullWindow), { display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' });
const FullWindow = ({ children }) => {
    return (React.createElement("div", { style: centroContainer }, children));
};

const _TextContainer = ({ children }, ref) => {
    return (React.createElement("div", { ref: ref, draggable: false, className: "basis-80 w-80 bg-yellow-50 p-11 text-3xl select-none bg-transparent" }, children));
};
const TextContainer = React.forwardRef(_TextContainer);

const getHandlerRect = (index, node) => {
    const range = document.createRange();
    range.setStart(node, index);
    range.setEnd(node, index);
    const rects = range.getClientRects();
    if (rects.length === 1) {
        return rects[0];
    }
    return null;
};
const getAllRects = (node, start, end) => {
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, end);
    return range.getClientRects();
};
const getNodeAndOffsetFromPoint = (x, y) => {
    let range;
    let textNode;
    let offset;
    if (document.caretPositionFromPoint) {
        range = document.caretPositionFromPoint(x, y);
        textNode = range.offsetNode;
        offset = range.offset;
    }
    else if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(x, y);
        textNode = range.startContainer;
        offset = range.startOffset;
    }
    else {
        return null;
    }
    if ((textNode === null || textNode === void 0 ? void 0 : textNode.nodeType) === document.TEXT_NODE) {
        if (!Number.isNaN(offset)) {
            return { node: textNode, offset };
        }
    }
    return null;
};
const useTextSelectionEditor = (initLeftPos, initRightPos, leftDrag, rightDrag) => {
    // left handler pos
    const [leftHandler, setLeftHandler] = React.useState(null);
    const [currentLeftPos, setCurrentLeftPos] = React.useState(initLeftPos);
    // right handler pos
    const [rightHandler, setRightHandler] = React.useState(null);
    const [currentRightPos, setCurrentRightPos] = React.useState(initRightPos);
    const [rects, setRects] = React.useState(null);
    // reference
    const textDiv = React.useRef(null);
    // mouse move handler
    // left handler
    React.useEffect(() => {
        const handlerMove = (e) => {
            var _a;
            if (!leftDrag)
                return;
            const sm = getNodeAndOffsetFromPoint(e.clientX, e.clientY);
            if (sm
                && sm.node === ((_a = textDiv.current) === null || _a === void 0 ? void 0 : _a.childNodes[0])
                && sm.offset <= currentRightPos) {
                setCurrentLeftPos(sm.offset);
            }
        };
        document.addEventListener('mousemove', handlerMove);
        return () => {
            document.removeEventListener('mousemove', handlerMove);
        };
    }, [leftDrag, currentRightPos]);
    React.useEffect(() => {
        setCurrentLeftPos(initLeftPos);
    }, [initLeftPos]);
    // right handler
    React.useEffect(() => {
        const handlerMove = (e) => {
            var _a;
            if (!rightDrag)
                return;
            const sm = getNodeAndOffsetFromPoint(e.clientX, e.clientY);
            if (sm
                && sm.node === ((_a = textDiv.current) === null || _a === void 0 ? void 0 : _a.childNodes[0])
                && sm.offset >= currentLeftPos) {
                setCurrentRightPos(sm.offset);
            }
        };
        document.addEventListener('mousemove', handlerMove);
        return () => {
            document.removeEventListener('mousemove', handlerMove);
        };
    }, [rightDrag, currentLeftPos]);
    React.useEffect(() => {
        setCurrentRightPos(initRightPos);
    }, [initRightPos]);
    // draw init left handler
    React.useEffect(() => {
        if (textDiv.current
            && textDiv.current.childNodes.length === 1
            && textDiv.current.childNodes[0].nodeType === document.TEXT_NODE) {
            const rect = getHandlerRect(currentLeftPos, textDiv.current.childNodes[0]);
            if (rect === null) {
                setLeftHandler(null);
                setRects(null);
            }
            else {
                setLeftHandler({
                    height: rect.height,
                    left: rect.left,
                    top: rect.top,
                });
            }
        }
    }, [currentLeftPos]);
    // draw init right handler
    React.useEffect(() => {
        if (textDiv.current
            && textDiv.current.childNodes.length === 1
            && textDiv.current.childNodes[0].nodeType === document.TEXT_NODE) {
            const rect = getHandlerRect(currentRightPos, textDiv.current.childNodes[0]);
            if (rect === null) {
                setRightHandler(null);
                setRects(null);
            }
            else {
                setRightHandler({
                    height: rect.height,
                    left: rect.left,
                    top: rect.top,
                });
            }
        }
    }, [currentRightPos]);
    React.useEffect(() => {
        var _a;
        const n = (_a = textDiv.current) === null || _a === void 0 ? void 0 : _a.childNodes[0];
        if (n)
            setRects(getAllRects(n, currentLeftPos, currentRightPos));
    }, [currentLeftPos, currentRightPos]);
    // return
    return [textDiv, leftHandler, rightHandler, rects];
};

var _path$1;
function _extends$1() { _extends$1 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1.apply(this, arguments); }
var SvgQuoteLeft = function SvgQuoteLeft(props) {
  return /*#__PURE__*/React__namespace.createElement("svg", _extends$1({
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24
  }, props), _path$1 || (_path$1 = /*#__PURE__*/React__namespace.createElement("path", {
    d: "M13 14.725C13 9.584 16.892 4.206 23 3l.984 2.126c-2.215.835-4.163 3.742-4.38 5.746A5.213 5.213 0 0 1 24 16.021C24 19.203 21.416 21 18.801 21 15.786 21 13 18.695 13 14.725zm-13 0C0 9.584 3.892 4.206 10 3l.984 2.126c-2.215.835-4.163 3.742-4.38 5.746A5.213 5.213 0 0 1 11 16.021C11 19.203 8.416 21 5.801 21 2.786 21 0 18.695 0 14.725z"
  })));
};

var _path;
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
var SvgQuoteRight = function SvgQuoteRight(props) {
  return /*#__PURE__*/React__namespace.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24
  }, props), _path || (_path = /*#__PURE__*/React__namespace.createElement("path", {
    d: "M11 9.275C11 14.416 7.108 19.794 1 21l-.984-2.126c2.215-.835 4.163-3.742 4.38-5.746A5.213 5.213 0 0 1 0 7.979C0 4.797 2.584 3 5.199 3 8.214 3 11 5.305 11 9.275zm13 0C24 14.416 20.108 19.794 14 21l-.984-2.126c2.215-.835 4.163-3.742 4.38-5.746A5.213 5.213 0 0 1 13 7.979C13 4.797 15.584 3 18.199 3 21.214 3 24 5.305 24 9.275z"
  })));
};

const SelectionHandler = ({ pos, grab, setGrab, left }) => {
    return (pos &&
        React.createElement("div", { draggable: false, className: `bg-yellow-300 opacity-80 ${left ? 'rounded-l-md' : 'rounded-r-md'}`, style: {
                position: 'absolute',
                display: 'flex',
                left: left ? pos.left - 24 : pos.left - 1,
                top: pos.top,
                width: '25px',
                height: pos.height,
                cursor: grab ? 'grabbing' : 'grab',
                alignItems: left ? 'flex-start' : 'flex-end',
            }, onMouseDown: () => {
                setGrab(true);
                const handler = () => {
                    setGrab(false);
                    document.removeEventListener('mouseup', handler);
                };
                document.addEventListener('mouseup', handler);
            }, onMouseUp: () => {
                setGrab(false);
            } }, left
            ? React.createElement(SvgQuoteLeft, null)
            : React.createElement(SvgQuoteRight, null)));
};

const TextSelectionZone = ({ initLeftPos, initRightPos, children, }) => {
    const [mouseOnLeft, setMouseOnLeft] = React.useState(false);
    const [mouseOnRight, setMouseOnRight] = React.useState(false);
    const [textDiv, leftHandler, rightHandler, rects] = useTextSelectionEditor(initLeftPos, initRightPos, mouseOnLeft, mouseOnRight);
    let divs = [];
    if (rects) {
        for (let i = 0; i < rects.length; ++i) {
            const aa = rects.item(i);
            if (aa)
                divs.push(aa);
        }
    }
    return (React.createElement("div", { draggable: false, style: {
            display: 'flex',
        } },
        divs.map((d, i) => React.createElement("div", { key: i, className: 'bg-yellow-300', style: {
                userSelect: 'none',
                position: 'absolute',
                top: `${d.top}px`,
                left: `${d.left}px`,
                width: `${d.width}px`,
                height: `${d.height}px`,
                zIndex: -2,
            } }, "\u00A0")),
        React.createElement(SelectionHandler, { grab: mouseOnLeft, left: true, pos: leftHandler, setGrab: (v) => setMouseOnLeft(v) }),
        React.createElement(TextContainer, { ref: textDiv }, children),
        React.createElement(SelectionHandler, { grab: mouseOnRight, left: false, pos: rightHandler, setGrab: (v) => setMouseOnRight(v) })));
};

exports.FullWindow = FullWindow;
exports.TextSelectionZone = TextSelectionZone;
