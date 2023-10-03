import * as React from "react";
import { render } from "@testing-library/react";

import "jest-canvas-mock";

import { FullWindow } from "../src";

describe("rendering", () => {
    it('renders', () => {
        render(<FullWindow>Some Text</FullWindow>);
    });
});
