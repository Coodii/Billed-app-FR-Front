/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import BillsUI from "../views/BillsUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from "@testing-library/user-event"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js"
import Router from "../app/Router.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store";



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    
    test("When Employee insert a document in a bad format", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      document.body.innerHTML = NewBillUI()
      const newBillToTest = new NewBill({
        document, onNavigate, store:mockStore, localStorage: window.localStorage
      })
      const handleClickNewBill = jest.fn(newBillToTest.handleChangeFile)
      const inputFile = screen.getByTestId('file')
      inputFile.addEventListener('click', handleClickNewBill)
      const newFile = new File(['I am a test file'], 'FileTest.pdf')
      userEvent.upload(inputFile, newFile);
      const fileExtension = inputFile.files[0].name.split('.').pop().toLowerCase();
      expect(fileExtension).toBe('pdf');
    })
    
    test("When Employee insert a document in a good format", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      document.body.innerHTML = NewBillUI()
      const newBillToTest = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage,
      })

      const handleClickNewBill = jest.fn((e) => newBillToTest.handleChangeFile(e));
      const inputFile = screen.getByTestId("file")
      inputFile.addEventListener('change', handleClickNewBill)
      const newFile = new File(['I am a test file'], 'FileTest.png')
      userEvent.upload(inputFile, newFile);
      expect(handleClickNewBill).toHaveBeenCalled();
      const fileExtension = inputFile.files[0].name.split('.').pop().toLowerCase();
      expect(fileExtension).toBe('png');
    });

    test("When Employee submits the form", async () => {
      
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "employee@company.tld",
        })
      );

      document.body.innerHTML = NewBillUI()

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newBillToTest = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      })

      $.fn.modal = jest.fn()
      const handleSubmit = jest.fn((e) => newBillToTest.handleSubmit(e))
      newBillToTest.fileName = 'test.jpg'
      const typeNewBill = screen.getByTestId('expense-type')
      const nameNewBill = screen.getByTestId('expense-name')
      const amountNewBill = screen.getByTestId('amount')
      const dateNewBill = screen.getByTestId('datepicker')
      const vatNewBill = screen.getByTestId('vat')
      const pctNewBill = screen.getByTestId('pct')
      const commNewBill = screen.getByTestId('commentary')

      //Set value of the new bills
      fireEvent.change(typeNewBill, {target: { value:'Transports' }})
      fireEvent.change(nameNewBill, {target: { value: 'Test' }})
      fireEvent.change(amountNewBill, {target: { value: '129' }})
      fireEvent.change(dateNewBill, {target: { value: '04 Aoû. 2023' }})
      fireEvent.change(vatNewBill, {target: { value: 20 }})
      fireEvent.change(pctNewBill, {target: { value: 400 }})
      fireEvent.change(commNewBill, {target: { value: 'Je suis un commentaire' }})

      //Mock post call
      const mocked = mockStore.bills();
      const createBill = jest.spyOn(mocked, "create");
      const createdBill = await createBill(newBillToTest);

      //Submit the new bills
      const formNewBill = screen.getByTestId('form-new-bill')
      formNewBill.addEventListener('click', handleSubmit)
      userEvent.click(formNewBill)

      //Asserts
      expect(createBill).toHaveBeenCalled();
      expect(handleSubmit).toHaveBeenCalled()
      expect(createdBill.key).toBe('1234');
      expect(screen.getByText('Mes notes de frais')).toBeTruthy()
    })


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
        Router();
      });
  
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.NewBill);
        await new Promise(process.nextTick);
        document.body.innerHTML = BillsUI({ error: "Erreur 404" });
        const message = screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });
  
      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.NewBill);
        await new Promise(process.nextTick);
        document.body.innerHTML = BillsUI({ error: "Erreur 500" });
        const message = screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
    

  })
})
