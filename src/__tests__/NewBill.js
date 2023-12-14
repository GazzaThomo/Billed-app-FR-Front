/**
 * @jest-environment jsdom
 */

import {
  getByTestId,
  getAllByTestId,
  screen,
  waitFor,
} from "@testing-library/dom";
import "@testing-library/jest-dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then enveloppe icon in vertical layout should ne highlighted", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");
      //to-do write expect expression
      expect(mailIcon.classList.contains("active-icon")).toBeTruthy();
    });

    //to write
    // describe("When a file is uploaded", () => {
    //   test("If file type is incorrect format then error-message should appear");
    //   test(
    //     "If file type is correct format then error-message should not appear and file handled"
    //   );
    // });
    // test("When i click on Submit a new bill should be created"); //THIS IS POST FUNCTION
  });
});
