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
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import { handleChangeFile } from "../containers/NewBill.js";

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

    describe("When a file is uploaded", () => {
      test("If file type is incorrect format, then error message should appear", async () => {
        //test
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
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const store = null;
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });
        const fileToUpload = new File(["Test File"], "testFile.txt", {
          type: "text/plain",
        });
        const fileInput = screen.getByTestId("file");
        const handleChange = jest.fn((e) => newBill.handleChangeFile(e));
        fileInput.addEventListener("change", handleChange);

        userEvent.upload(fileInput, fileToUpload);

        await waitFor(() => {
          expect(handleChange).toHaveBeenCalled();
        });
        expect(fileInput.files[0]).toStrictEqual(fileToUpload);

        //
        // Use findByTestId to wait for the error message element to be present
        const errorMessage = await screen.findByTestId(
          "file-type-error-message"
        );
        expect(errorMessage.classList.contains("hidden")).toBe(false);
      }); //TEST END

      test("If file type is correct format, then the file should be handled", async () => {
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
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const store = null;
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });

        const fileToUpload = new File(["test file"], "testImage.jpg", {
          type: "image/jpg",
        });

        const fileInput = screen.getByTestId("file");
        const handleChange = jest.fn((e) => newBill.handleChangeFile(e));
        fileInput.addEventListener("change", handleChange);
        userEvent.upload(fileInput, fileToUpload);

        await waitFor(() => {
          expect(handleChange).toHaveBeenCalled();
        });
        expect(fileInput.files[0]).toStrictEqual(fileToUpload);
        const errorMessage = await screen.getByTestId(
          "file-type-error-message"
        );
        expect(errorMessage.classList.contains("hidden")).toBeTruthy();
      }); //TEST END
    });
    // describe("When submit button is clicked", () => {
    //   test("Then a new bill should be created", () => {});
    // });
  });
});
