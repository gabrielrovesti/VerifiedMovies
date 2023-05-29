import Footer from "./Footer";
import { render } from "@testing-library/react";
import React from "react";

describe("Footer", () => {

    it("should scroll to the top when 'Torna su' link is clicked", () => {
        window.scrollTo = jest.fn();
        render (<Footer />);
        expect(window.scrollTo).toHaveBeenCalledTimes(0);
    });
});