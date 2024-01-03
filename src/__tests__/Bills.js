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
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
    });

    test("Then bill icon in vertical layout should be highlighted", async () => {
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
      onNavigate(ROUTES_PATH.Bills);
      const eyes = await waitFor(() => screen.getAllByTestId("icon-eye"));
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
          e.preventDefault();
          bill.handleClickIconEye(firstIconEye);
        });
        firstIconEye.addEventListener("click", handleClickIconEye);
        userEvent.click(firstIconEye);
        expect(handleClickIconEye).toHaveBeenCalled();
        // const modal = await waitFor(() => screen.getByTestId("modaleFile"));
        const titleText = await waitFor(() => screen.getByText("Justificatif"));
        // expect(modal).toHaveClass("show");
        expect(titleText).toBeTruthy();
      });
    });

    //to do
    describe("When I click on new bill", () => {
      test("then new bill window should open", async () => {
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

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
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
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
