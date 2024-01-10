/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import "@testing-library/jest-dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    // test("Then enveloppe icon in vertical layout should ne highlighted", async () => {
    //   const html = NewBillUI();
    //   document.body.innerHTML = html;
    //   //to-do write assertion
    //   Object.defineProperty(window, "localStorage", {
    //     value: localStorageMock,
    //   });
    //   window.localStorage.setItem(
    //     "user",
    //     JSON.stringify({
    //       type: "Employee",
    //     })
    //   );
    //   const root = document.createElement("div");
    //   root.setAttribute("id", "root");
    //   document.body.append(root);
    //   router();
    //   window.onNavigate(ROUTES_PATH.NewBill);
    //   await waitFor(() => screen.getByTestId("icon-mail"));
    //   const mailIcon = screen.getByTestId("icon-mail");
    //   //to-do write expect expression
    //   expect(mailIcon.classList.contains("active-icon")).toBeTruthy();
    // });

    describe("When a file is uploaded", () => {
      beforeAll(() => {
        let html = NewBillUI();
        document.body.innerHTML = html;
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
      });

      test("If file type is correct format, then the file should be handled", async () => {
        //to-do write assertion
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

        const fileToUpload = new File(["test file"], "testImage.jpg", {
          type: "image/jpg",
        });
        const fileInput = screen.getByTestId("file");

        const handleChange = jest.fn((e) => newBill.handleChangeFile(e));
        fileInput.addEventListener("change", handleChange);
        // userEvent.upload(fileInput, fileToUpload);
        fireEvent.change(fileInput, {
          target: {
            files: [fileToUpload],
          },
        });

        expect(handleChange).toHaveBeenCalled();
        expect(fileInput.files[0]).toStrictEqual(fileToUpload);
        await waitFor(() => {
          const errorMessage = screen.getByTestId("file-type-error-message");
          expect(errorMessage.classList.contains("hidden")).toBe(true);
        });
        expect(newBill.fileName).toBe("testImage.jpg");
      });

      test("If file type is incorrect format, then file should not be handled", async () => {
        //to-do write assertion
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

        const fileToUpload = new File(["test file"], "testImage.jpg", {
          type: "image/jpg",
        });
        const fileInput = screen.getByTestId("file");

        const handleChange = jest.fn((e) => newBill.handleChangeFile(e));
        fileInput.addEventListener("change", handleChange);
        fireEvent.change(fileInput, {
          target: {
            files: [fileToUpload],
          },
        });
        expect(handleChange).toHaveBeenCalled();

        expect(fileInput.files[0]).toStrictEqual(fileToUpload);
        await waitFor(() => {
          const errorMessage = screen.getByTestId("file-type-error-message");
          expect(errorMessage.classList.contains("hidden")).toBe(false);
        });
        expect(newBill.fileName).toBe(null);
      });
    });

    describe("When I click on submit", () => {
      test("then submit function should be called", async () => {
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

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

        const formNewBill = screen.getByTestId("form-new-bill");
        const handleSubmitSpy = jest.spyOn(newBill, "handleSubmit");
        const handleSubmit = jest.fn(newBill.handleSubmit);
        formNewBill.addEventListener("submit", handleSubmit);
        fireEvent.submit(formNewBill);

        await waitFor(() => {
          expect(handleSubmitSpy).toHaveBeenCalled();
        });
      });
      //POST TEST ?
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

        //METHOD 1
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

        const updateSpy = jest.spyOn(mockStore.bills(), "update");
        let form = screen.getByTestId("form-new-bill");
        form.addEventListener("submit", newBill.handleSubmit);
        fireEvent.submit(form);
        await waitFor(() => {
          expect(updateSpy).toHaveBeenCalled();
        });
        const postedBill = await mockStore.bills().update();
        expect(postedBill).toEqual(testBillData);

        //METHOD 2
        // const post = jest.spyOn(mockStore, "bills");
        // const postTestBillData = await mockStore.bills().update(testBillData);
        // expect(post).toHaveBeenCalledTimes(1);
        // expect(postTestBillData).toStrictEqual(testBillData);
      }); //END TEST
    });
  });
});
