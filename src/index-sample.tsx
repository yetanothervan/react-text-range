import React, { FunctionComponent, useState } from 'react';
import * as ReactDOMClient from 'react-dom/client';

import { TextContainer, RangeState, ReactTextRange } from "./ReactTextRange";

const MyTextContainer: TextContainer = React.forwardRef(({ children }, ref) =>
    <div ref={ref} style={{
        fontSize: 24,
        width: '320px',
        backgroundColor: 'rgba(253, 224, 71, .2)',
        userSelect: 'none',
        padding: '20px',
        whiteSpace: 'pre-wrap',
    }}>
        {children}
    </div>
);

const App: FunctionComponent = () => {
    const [myPos, setMyPos] = useState<RangeState>({ left: 23, right: 47 })
    return (
        <div style={{ margin: 20 }}>
            <ReactTextRange initLeftPos={23} initRightPos={47}
                Container={MyTextContainer} onChange={setMyPos}
                selectionColor='yellow' handlerWidth={18}>{
                    `Some text
or even some real good multiline text
here and there`}
            </ReactTextRange>
            <div>
                <span>{myPos?.left}</span>
                &nbsp;
                <span>{myPos?.right}</span>
            </div>
        </div>
    )
}

const render = () => {
    let elem = document.getElementById("root");
    const root = ReactDOMClient.createRoot(elem!);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
};
render();
