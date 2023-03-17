/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from "@testing-library/user-event"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js"
import Router from "../app/Router.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { mockedBills } from "../__mocks__/store"



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
        document, onNavigate, store:mockedBills, localStorage: window.localStorage
      })
      const handleClickNewBill = jest.fn(newBillToTest.handleChangeFile)
      const inputFile = screen.getByTestId('file')
      inputFile.addEventListener('click', handleClickNewBill)
      const newFile = new File(['I am a test file'], 'FileTest.pdf')
      userEvent.upload(inputFile, newFile);
      const isCorrectFormat = inputFile.getAttribute('data-correct-format')
      expect(isCorrectFormat).toBe('false')
    })
    
    test("When Employee insert a document in a good format", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      document.body.innerHTML = NewBillUI()
      const newBillToTest = new NewBill({
        document, onNavigate, store: mockedBills, localStorage: window.localStorage,
      })

      const handleClickNewBill = jest.fn((e) => newBillToTest.handleChangeFile(e));
      const inputFile = screen.getByTestId("file")
      inputFile.addEventListener('change', handleClickNewBill)
      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(["image.png"], "image.png", {
              type: "image/png",
            }),
          ],
        },
      });

      expect(handleClickNewBill).toHaveBeenCalled();
      const fileExtension = inputFile.files[0].name.split('.').pop().toLowerCase();
      const inputFile2 = screen.getByTestId('file')
      expect(fileExtension).toBe('png');
      const isCorrectFormat = inputFile2.getAttribute('data-correct-format')
      expect(isCorrectFormat).toBe('true')
    });

    test("When Employee submits the form", async () => {
      document.body.innerHTML = NewBillUI()

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newBillToTest = new NewBill({
        document,
        onNavigate,
        store: mockedBills,
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

      fireEvent.change(typeNewBill, {target: { value:'Transports' }})
      fireEvent.change(nameNewBill, {target: { value: 'Test' }})
      fireEvent.change(amountNewBill, {target: { value: '129' }})
      fireEvent.change(dateNewBill, {target: { value: '04 Aoû. 2023' }})
      fireEvent.change(vatNewBill, {target: { value: 20 }})
      fireEvent.change(pctNewBill, {target: { value: 400 }})
      fireEvent.change(commNewBill, {target: { value: 'Je suis un commentaire' }})
      const formNewBill = screen.getByTestId('form-new-bill')
      formNewBill.addEventListener('click', handleSubmit)
      userEvent.click(formNewBill)
      expect(handleSubmit).toHaveBeenCalled()
      expect(screen.getByText('Mes notes de frais')).toBeTruthy()
    })


    // describe("When an error occurs on API", () => {
    //     beforeEach(() => {
    //       Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    //       window.localStorage.setItem(
    //         'user',
    //         JSON.stringify({
    //           type: 'Employee',
    //           email: 'a@a',
    //         })
    //       )
    
    //       document.body.innerHTML = NewBillUI()
    //   })
    //   test("fetches bills from an API and fails with 404 message error", async () => {
  
    //     mockedBills.bills.mockImplementationOnce(() => {
    //       return {
    //         list : () =>  {
    //           return Promise.reject(new Error("Erreur 404"))
    //         }
    //       }})
    //     window.onNavigate(ROUTES_PATH.NewBill)
    //     await new Promise(process.nextTick);
    //     const message = await screen.getByText(/Erreur 404/)
    //     expect(message).toBeTruthy()
    //   })
  
    // })
  


  })
})
