/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then bill form should be rendered", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const form = screen.getByTestId("form-new-bill");
      expect(form).toBeTruthy();
    });

    test("Then file input change should trigger handleChangeFile", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const firestore = null;
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      const html = NewBillUI();
      document.body.innerHTML = html;

      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const fileInput = screen.getByTestId("file");
      fileInput.addEventListener("change", handleChangeFile);
      fireEvent.change(fileInput, {
        target: {
          files: [new File(["file"], "file.png", { type: "image/png" })],
        },
      });

      expect(handleChangeFile).toHaveBeenCalled();
    });
  });
  describe("Given I am connected as an employee on the NewBill Page", () => {
    test("Then handleSubmit should be called when the form is submitted", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const firestore = null;
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      const html = NewBillUI();
      document.body.innerHTML = html;

      const handleSubmit = jest.fn(newBill.handleSubmit);
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});
