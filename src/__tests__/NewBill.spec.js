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

//replaces any imports from app/store with the mockstore
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
        //setup html structure
        document.body.innerHTML = NewBillUI();
        //maock navigation function that updates DOM
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        //set store to null, not used in test
        const store = null;
        // instantiate a new NewBill object, passing in dependencies like the document, the mock navigation function, a null store (since it's not used in this test), and localStorage.
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage,
        });

        //mock alert function so it doesn't actually show, but we can monitor when it's called
        window.alert = jest.fn();
        //spy on the handleChangeFile method of the newBill instance to mock its implementation.
        jest.spyOn(newBill, "handleChangeFile").mockImplementation(() => {});

        //do file input and add eventlistener that triggers handlechangefile
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
      });
    });

    describe("When I click on submit", () => {
      test("Then handleSubmit function is called", async () => {
        document.body.innerHTML = NewBillUI();
        const store = mockStore;
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage,
        });

        //spy on the handleChangeFile method of the newBill instance to mock its implementation.
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
        // mocks a function to spy on the handleSubmit method. This spy function calls `newBill.handleSubmit` when invoked.
        const handleSubmitSpy = jest.fn((e) => newBill.handleSubmit(e));
        const form = screen.getByTestId("form-new-bill");
        form.addEventListener("submit", handleSubmitSpy);

        const btn = screen.getByTestId("btn-send-bill");
        btn.addEventListener("click", () => fireEvent.submit(form));
        userEvent.click(btn);

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

        //spyon : permet au test de monitorer les appels vers la fonction, sans exécuter la logique derrière
        const post = jest.spyOn(mockStore, "bills");
        const postTestBillData = await mockStore.bills().update(testBillData);
        expect(post).toHaveBeenCalledTimes(1);
        expect(postTestBillData).toStrictEqual(testBillData);
      }); //END TEST

      // describe("When there is a problem with API", () => {
      //   test("Then should fail with a 404", async () => {
      //     //Here we spy on the console, see ./containers/NewBill.js line 112
      //     const postSpy = jest.spyOn(console, "error");

      //     // Directly mocking the store to simulate the behavior for this test scenario
      //     //We only want to check the update for an error, as that's the function that "post's" the bill. So we modify the response from the API
      //     const mockStore = {
      //       bills: jest.fn(() => newBill.store),
      //       create: jest.fn(() => Promise.resolve({})),
      //       update: jest.fn(() => Promise.reject(new Error("404"))),
      //     };

      //     // Initialize NewBill with the mocked store
      //     const newBill = new NewBill({
      //       document,
      //       onNavigate,
      //       store: mockStore, // Use the mockStore directly
      //       localStorage,
      //     });

      //     // form submit stuff
      //     const form = screen.getByTestId("form-new-bill");
      //     form.addEventListener("submit", (e) => newBill.handleSubmit(e));

      //     // Trigger form submission
      //     fireEvent.submit(form);

      //     // Wait for all promises to finish
      //     await new Promise(process.nextTick);

      //     // Verify that console.error was called with an Error containing "404"
      //     expect(postSpy).toHaveBeenCalledWith(expect.any(Error));
      //     expect(postSpy).toHaveBeenCalledWith(
      //       expect.objectContaining({ message: "404" })
      //     );
      //   });

      //   test("Then should fail with a 500", async () => {
      //     //Here we spy on the console, see ./containers/NewBill.js line 112
      //     const postSpy = jest.spyOn(console, "error");

      //     // Directly mocking the store to simulate the behavior for this test scenario
      //     //We only want to check the update for an error, as that's the function that "post's" the bill. So we modify the response from the API
      //     const mockStore = {
      //       bills: jest.fn(() => newBill.store),
      //       create: jest.fn(() => Promise.resolve({})),
      //       update: jest.fn(() => Promise.reject(new Error("500"))),
      //     };

      //     // Initialize NewBill with the mocked store
      //     const newBill = new NewBill({
      //       document,
      //       onNavigate,
      //       store: mockStore, // Use the mockStore directly
      //       localStorage,
      //     });

      //     // form submit stuff
      //     const form = screen.getByTestId("form-new-bill");
      //     form.addEventListener("submit", (e) => newBill.handleSubmit(e));

      //     // Trigger form submission
      //     fireEvent.submit(form);

      //     // Wait for all promises to finish
      //     await new Promise(process.nextTick);

      //     // Verify that console.error was called with an Error containing "404"
      //     expect(postSpy).toHaveBeenCalledWith(expect.any(Error));
      //     expect(postSpy).toHaveBeenCalledWith(
      //       expect.objectContaining({ message: "500" })
      //     );
      //   });
      // });
    });
  });
});
