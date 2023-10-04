import * as React from "react";
import { render } from "@testing-library/react";

import "jest-canvas-mock";

import { FullWindow } from "../src";

describe("rendering", () => {
    it('renders 1', () => {
        render(<FullWindow>Some Text</FullWindow>);
    });

    /* it('renders 2', () => {
        render(
            <FullWindow>
                <TextSelectionZone initLeftPos={2} initRightPos={4}>
                    some text
                </TextSelectionZone>
            </FullWindow>
        );
    }); */
});
