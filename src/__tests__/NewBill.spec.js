/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor, getByTestId } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import usersTest from "../constants/usersTest.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );
  });
  describe("When I am on NewBill Page", () => {
    test("Then enveloppe icon in vertical layout should ne highlighted", async () => {
      //to-do write assertion
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
      test("If file type is incorrect, then the file isn't handled, and error message appears ", async () => {
        document.body.innerHTML = NewBillUI();
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const store = null;
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage,
        });

        // mock the handleChangeFile method
        window.alert = jest.fn();
        jest.spyOn(newBill, "handleChangeFile").mockImplementation(() => {});

        const fileInput = screen.getByTestId("file");
        fileInput.addEventListener("change", newBill.handleChangeFile);
        const fileToUpload = new File(["This is a test file"], "testFile.txt", {
          type: "text/plain",
        });
        fireEvent.change(fileInput, {
          target: {
            files: [fileToUpload],
          },
        });

        expect(fileInput.value).toBe("");
        expect(newBill.handleChangeFile).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalled();

        //NOT NEEDED IF USING ALERT
        // await waitFor(() => {
        //   const errorMessage = screen.getByTestId("file-type-error-message");
        //   expect(errorMessage.classList.contains("hidden")).toBe(false);
        // });
      });

      //TODO
      test("If file type is correct, then the file is handled, and error message does not appear", async () => {
        document.body.innerHTML = NewBillUI();
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage,
        });

        jest.spyOn(newBill, "handleChangeFile").mockImplementation(() => {});

        const fileInput = screen.getByTestId("file");
        fileInput.addEventListener("change", newBill.handleChangeFile);
        const fileToUpload = new File(["This is a test"], "testImage.png", {
          type: "image/png",
        });
        fireEvent.change(fileInput, {
          target: {
            files: [fileToUpload],
          },
        });

        expect(fileInput.files[0].name).toBe("testImage.png");
        expect(newBill.formData).toBeDefined();
        expect(newBill.handleChangeFile).toHaveBeenCalled();

        //NOT NEEDED IF USING AN ALERT INSTEAD OF TEXT
        // await waitFor(() => {
        //   const errorMessage = screen.getByTestId("file-type-error-message");
        //   expect(errorMessage.classList.contains("hidden")).toBe(false);
        // });
      });
    });

    describe("When I click on submit", () => {
      //TODO : CORRECT THE ERROR SOMEHOW
      test("Then handleSubmit function is called", async () => {
        document.body.innerHTML = NewBillUI();
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const store = mockStore;
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage,
        });

        jest.fn(newBill, "handleChangeFile");
        const fileInput = screen.getByTestId("file");
        fileInput.addEventListener("change", newBill.handleChangeFile);
        const fileToUpload = new File(["This is a test"], "testImage.png", {
          type: "image/png",
        });
        fireEvent.change(fileInput, {
          target: {
            files: [fileToUpload],
          },
        });

        const handleSubmitSpy = jest.spyOn(newBill, "handleSubmit");
        const form = screen.getByTestId("form-new-bill");
        form.addEventListener("submit", newBill.handleSubmit);
        fireEvent.submit(form);
        await waitFor(() => {
          expect(handleSubmitSpy).toHaveBeenCalled();
        });
      });

      //POST TEST
      test("Then bill should be added", async () => {
        const testBillData = {
          id: "47qAXb6fIm2zOKkLzMro",
          vat: "80",
          fileUrl:
            "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
          status: "pending",
          type: "Hôtel et logement",
          commentary: "séminaire billed",
          name: "encore",
          fileName: "preview-facture-free-201801-pdf-1.jpg",
          date: "2004-04-04",
          amount: 400,
          commentAdmin: "ok",
          email: "a@a",
          pct: 20,
        };

        const post = jest.spyOn(mockStore, "bills");
        const postTestBillData = await mockStore.bills().update(testBillData);
        expect(post).toHaveBeenCalledTimes(1);
        expect(postTestBillData).toStrictEqual(testBillData);
      }); //END TEST
    });
  });
});
