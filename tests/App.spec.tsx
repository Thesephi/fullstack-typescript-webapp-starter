/**
 * @jest-environment jsdom
 */

import "jest";
import * as React from "react";
import { act, Simulate } from "react-dom/test-utils";
import { createRoot, Root } from "react-dom/client";
import App from "../src/client/App";

describe("App", () => {

  let root: Root;
  let container: HTMLDivElement | null;

  let defaultFetch: any = window.fetch;
  let mockFetch = jest.fn((entry) => Promise.resolve({
    json: () => Promise.resolve({ message: `Yay`, details: { foo: "bar" } })
  }));

  beforeAll(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container!);
    act(() => {
      root.render(<App />);
    });
    window.fetch = mockFetch as any;
  });

  afterAll(() => {
    act(() => {
      root.unmount();
    });
    document.body.removeChild(container!);
    container = null;
    window.fetch = defaultFetch;
  });

  it("should render the dialog DOM as specified", () => {
    const dialog = document.querySelector(".the-dialog")!;
    expect(dialog.innerHTML).toMatchSnapshot();
  });

  it("should not show any error in the beginning", () => {
    const calloutErrors = document.querySelector(".feedback-error");
    expect(calloutErrors).toBeNull();
  });

  it("should show errors if the submit button is clicked when all fields are still invalid", () => {

    const submitBtn = document.querySelector("button[type=submit]") as HTMLButtonElement;
    expect(submitBtn).not.toBeNull();

    const form: HTMLFormElement = document.querySelector("form") as HTMLFormElement;
    expect(form.contains(submitBtn)).toEqual(true);

    // @TODO find out why simulating the `click` event on the submit button does
    // not work, but simulating the `submit` event on the form does
    // const submitBtn = document.querySelector("button[type=submit]") as HTMLButtonElement;
    // await act(async () => {
    //   Simulate.click(submitBtn);
    // });

    act(() => {
      Simulate.submit(form);
    });

    expect(mockFetch).not.toHaveBeenCalled();

    const calloutErrors = document.querySelector(".feedback-error") as HTMLElement;
    expect(calloutErrors).not.toBeNull();

    expect(calloutErrors.innerHTML).toMatchSnapshot();

  });

  it("should still show errors if the submit button is clicked when only 1 field is valid", async () => {

    const firstNameInput: HTMLInputElement = document.querySelector("input[name=firstName]") as HTMLInputElement;
    expect(firstNameInput).not.toBeNull();

    await act(async () => {
      firstNameInput.value = "John "; // the space is deliberate
      Simulate.change(firstNameInput);
    });

    const submitBtn = document.querySelector("button[type=submit]") as HTMLButtonElement;
    await act(async () => {
      Simulate.click(submitBtn);
    });

    expect(mockFetch).not.toHaveBeenCalled();

    const calloutErrors = document.querySelector(".feedback-error") as HTMLElement;
    expect(calloutErrors.innerHTML).toMatchSnapshot();

  });

  it("should still show errors if the submit button is clicked when only 2 fields are valid", async () => {

    const lastNameInput: HTMLInputElement = document.querySelector("input[name=lastName]") as HTMLInputElement;
    expect(lastNameInput).not.toBeNull();

    await act(async () => {
      lastNameInput.value = " Doe"; // the space is deliberate
      Simulate.change(lastNameInput);
    });

    const submitBtn = document.querySelector("button[type=submit]") as HTMLButtonElement;
    await act(async () => {
      Simulate.click(submitBtn);
    });

    expect(mockFetch).not.toHaveBeenCalled();

    const calloutErrors = document.querySelector(".feedback-error") as HTMLElement;
    expect(calloutErrors.innerHTML).toMatchSnapshot();

  });

  it("should make the POST call & show no errors if the submit button is clicked when all fields are valid", async () => {

    const emailInput: HTMLInputElement = document.querySelector("input[name=email]") as HTMLInputElement;
    expect(emailInput).not.toBeNull();

    /*
    const dateInput: HTMLInputElement = document.querySelector("input[name=eventDate]") as HTMLInputElement;
    expect(dateInput).not.toBeNull();

    // simulate a date being selected via the DatePicker
    const selectedDate: string = (new Date(dateInput.value)).toLocaleDateString();
    await act(async () => {
        dateInput.value = selectedDate;
        Simulate.change(dateInput);
    });
    */

    await act(async () => {
      emailInput.value = "john.doe@email.com";
      Simulate.change(emailInput);
    });

    // @TODO find out why simulating the `click` event on the submit button does
    // not work, but simulating the `submit` event on the form does
    // const submitBtn = document.querySelector("button[type=submit]") as HTMLButtonElement;
    // await act(async () => {
    //   Simulate.click(submitBtn);
    // });

    const form: HTMLFormElement = document.querySelector("form") as HTMLFormElement;
    await act(async () => {
      Simulate.submit(form);
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenLastCalledWith("/entry", expect.objectContaining({
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@email.com",
        // eventDate: new Date(dateInput.value).getTime()
      })
    }));

    const calloutErrors = document.querySelector(".feedback-error") as HTMLElement;
    expect(calloutErrors).toBeNull();

    const calloutFeedback = document.querySelector(".feedback-info") as HTMLElement;
    expect(calloutFeedback.innerHTML).toMatchSnapshot();

  });

});
