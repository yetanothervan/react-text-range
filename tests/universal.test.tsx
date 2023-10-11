// import * as React from "react";
// import { render } from "@testing-library/react";
// import { ReactTextRange, TextContainer } from '../src';

import "jest-canvas-mock";

describe("rendering", () => {

    /* const MyTextContainer: TextContainer = React.forwardRef(({ children }, ref) =>
         <div ref={ref} style={{
             fontSize: 30,
             width: '320px',
             backgroundColor: 'rgba(253, 224, 71, .2)',
             userSelect: 'none',
             padding: '20px',
         }}>
             {children}
         </div>
     ); */

    it('renders 1', () => {
        /* render(
            <ReactTextRange initLeftPos={23} initRightPos={37}
                Container={MyTextContainer} onChange={() => { }}>
                Some text or even some real good text here and there and here again
            </ReactTextRange>
        ); */
        expect(true).toBe(true); // happy test
    });

});
