/**
 * @jest-environment jsdom
 */

import {
  getByTestId,
  getAllByTestId,
  fireEvent,
  screen,
  waitFor,
} from "@testing-library/dom";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

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

        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();
      });

      test("If file type is correct format, then the file should be handled", async () => {
        const newBillForm = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: localStorageMock,
        });

        const handleChange = jest.fn(newBillForm.handleChangeFile);
        const fileToUpload = new File(["test file"], "testImage.jpg", {
          type: "image/jpg",
        });
        const fileInput = screen.getByTestId("file");
        fileInput.addEventListener("change", handleChange);
        userEvent.upload(fileInput, fileToUpload);

        expect(fileInput.files[0]).toStrictEqual(fileToUpload);
        expect(handleChange).toHaveBeenCalled();
        const errorMessage = await waitFor(() =>
          screen.getByTestId("file-type-error-message")
        );
        expect(errorMessage.classList.contains("hidden")).toBe(true);
        // const html = NewBillUI();
        // document.body.innerHTML = html;
        // //to-do write assertion

        // const fileToUpload = new File(["test file"], "testImage.jpg", {
        //   type: "image/jpg",
        // });

        // const fileInput = screen.getByTestId("file");
        // const handleChange = jest.fn((e) => newBill.handleChangeFile(e));
        // fileInput.addEventListener("change", handleChange);
        // await waitFor(() => userEvent.upload(fileInput, fileToUpload));

        // await waitFor(() => {
        //   expect(handleChange).toHaveBeenCalled();
        // });
        // expect(fileInput.files[0]).toStrictEqual(fileToUpload);
        // const errorMessage = await waitFor(() =>
        //   screen.getByTestId("file-type-error-message")
        // );
        // //add the expect createBill to have been called ?
        // expect(errorMessage.classList.contains("hidden")).toBe(true);
      }); //TEST END
      test("If file type is incorrect format, then error message should appear", async () => {
        const newBillForm = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: localStorageMock,
        });

        const handleChange = jest.fn(newBillForm.handleChangeFile);
        const fileToUpload = new File(["test file"], "testImage.jpg", {
          type: "image/jpg",
        });
        const fileInput = screen.getByTestId("file");
        fileInput.addEventListener("change", handleChange);
        userEvent.upload(fileInput, fileToUpload);

        expect(fileInput.files[0]).toStrictEqual(fileToUpload);
        expect(handleChange).toHaveBeenCalled();
        const errorMessage = await waitFor(() =>
          screen.getByTestId("file-type-error-message")
        );
        expect(errorMessage.classList.contains("hidden")).toBe(false);
        //test
        // const html = NewBillUI();
        // document.body.innerHTML = html;
        // //to-do write assertion
        // const fileToUpload = new File(["Test File"], "testFile.txt", {
        //   type: "text/plain",
        // });
        // const fileInput = screen.getByTestId("file");
        // const handleChange = jest.fn((e) => newBill.handleChangeFile(e));
        // fileInput.addEventListener("change", handleChange);

        // await waitFor(() => userEvent.upload(fileInput, fileToUpload));

        // await waitFor(() => {
        //   expect(handleChange).toHaveBeenCalled();
        // });
        // expect(fileInput.files[0]).toStrictEqual(fileToUpload);

        // const errorMessage = await screen.getByTestId(
        //   "file-type-error-message"
        // );
        // //add the expect createBill to have been called ?
        // expect(errorMessage.classList.contains("hidden")).toBe(false);
      }); //TEST END
    });

    describe("When I click on submit", () => {
      const testBillData = {
        id: "56qADb6fIm2zOGGLzMBc",
        vat: "60",
        fileUrl: "testLink",
        status: "pending",
        type: "Hôtel et logement",
        commentary: "Hotel séminaire",
        name: "Hotel ritz",
        fileName: "testName.jpg",
        date: "2014-06-07",
        amount: 666,
        commentAdmin: "très bien",
        email: "a@a",
        pct: 20,
      };

      //POST TEST ?
      test("Then bill should be submitted and user returned to home page", async () => {
        const html = NewBillUI();
        document.body.innerHTML = html;

        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "antoine@dupont.fr",
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

        //get the cells
        const expenseType = screen.getByTestId("expense-type");
        const expenseName = screen.getByTestId("expense-name");
        const date = screen.getByTestId("datepicker");
        const amount = screen.getByTestId("amount");
        const vat = screen.getByTestId("vat");
        const pct = screen.getByTestId("pct");
        const commentaire = screen.getByTestId("commentary");

        //insert the data into the cells
        userEvent.selectOptions(expenseType, testBillData.type);
        userEvent.change(expenseName, { target: { value: testBillData.name } });
        userEvent.change(date, { target: testBillData.date });
        userEvent.change(amount, { target: testBillData.amount });
        userEvent.change(vat, { target: testBillData.vat });
        userEvent.change(pct, { target: testBillData.pct });
        userEvent.change(commentaire, { target: testBillData.commentary });

        //create the submit handler
        expect(expenseType.value).toBe(testBillData.type);
        expect(expenseName.value).toBe(testBillData.name);
        expect(date.value).toBe(testBillData.date);
        expect(amount.value).toBe(testBillData.amount);
        expect(vat.value).toBe(testBillData.vat);
        expect(pct.value).toBe(testBillData.pct);
        expect(commentaire.value).toBe(testBillData.commentary);

        const formBill = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn((e) => {
          newBill.handleSubmit(e);
        });
        formBill.addEventListener("submit", handleSubmit);
        fireEvent.submit(formBill);

        await expect(handleSubmit).toHaveBeenCalled();
        expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
      }); //END TEST
    });
  });
});
