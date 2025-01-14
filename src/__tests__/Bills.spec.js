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
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import Bills, { handleClickIconEye } from "../containers/Bills.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    //this initializes the page
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

    test("Then bill icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy();
    });

    test("Then bills should be ordered from earliest to latest", async () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = await waitFor(() =>
        screen
          .getAllByText(
            /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
          )
          .map((a) => a.innerHTML)
      );
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    //test GET
    test("Then bills are loaded from mock API", async () => {
      //cett partie sert à naviger vers la page
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      onNavigate(ROUTES_PATH.Bills);

      //here we verify that there are 4 eyes on the page
      const eyes = await waitFor(() => screen.getAllByTestId("icon-eye"));
      expect(eyes.length).toBe(4);
      expect(eyes).toBeTruthy();
    });

    describe("when I click on an eye icon", () => {
      test("Then a modal should show", async () => {
        const testBill = [
          {
            id: "qcCK3SzECmaZAGRrHjaC",
            status: "refused",
            pct: 20,
            amount: 200,
            email: "a@a",
            name: "test2",
            vat: "40",
            fileName: "preview-facture-free-201801-pdf-1.jpg",
            date: "2002-02-02",
            commentAdmin: "pas la bonne facture",
            commentary: "test2",
            type: "Restaurants et bars",
            fileUrl:
              "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=4df6ed2c-12c8-42a2-b013-346c1346f732",
          },
        ];

        document.body.innerHTML = BillsUI({ data: testBill });
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const store = null;
        const bill = new Bills({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });
        const firstIconEye = screen.getAllByTestId("icon-eye")[0];
        const handleClickIconEye = jest.fn((e) => {
          // e.preventDefault();
          bill.handleClickIconEye(firstIconEye);
        });
        firstIconEye.addEventListener("click", handleClickIconEye);
        userEvent.click(firstIconEye);
        expect(handleClickIconEye).toHaveBeenCalled();
        const titleText = await waitFor(() => screen.getByText("Justificatif"));
        expect(titleText).toBeTruthy();
      });
    });

    describe("When I click on new bill", () => {
      test("then new bill window should open", async () => {
        document.body.innerHTML = BillsUI({ data: bills });
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const store = null;
        const bill = new Bills({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });
        const newBillButton = screen.getByTestId("btn-new-bill");
        const handleClickNewBill = jest.fn(bill.handleClickNewBill);
        newBillButton.addEventListener("click", handleClickNewBill);
        userEvent.click(newBillButton);

        await expect(handleClickNewBill).toHaveBeenCalled();
        expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
      });
    });

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      test("gets bill from API and fails with 404 error", async () => {
        // mocks the bills method of the mockStore object to simulate an API call that fails.
        // mock implementation is set up to only affect the next call (mockImplementationOnce) so next tests aren't affected
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              //simulate api response with rejected promise
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        //navigate to bills page
        window.onNavigate(ROUTES_PATH.Bills);
        //waits for promises to be initiated by navigation - need to read up on this
        await new Promise(process.nextTick);
        //retrieve error message on page
        const errMessage = await screen.getByText(/Erreur 404/);
        expect(errMessage).toBeTruthy();
      });

      test("gets bill from API and fails with 500 error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const errMessage = await screen.getByText(/Erreur 500/);
        expect(errMessage).toBeTruthy();
      });
    });
  });
});
