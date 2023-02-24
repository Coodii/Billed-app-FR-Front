/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from "@testing-library/user-event"
import { ROUTES } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    
    test("When Employee insert a document in a bad format", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      document.body.innerHTML = NewBillUI()
      const newBillToTest = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
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
      const store = null
      document.body.innerHTML = NewBillUI()
      const newBillToTest = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
      })
      const handleClickNewBill = jest.fn(newBillToTest.handleChangeFile)
      const inputFile = screen.getByTestId('file')
      inputFile.addEventListener('change', handleClickNewBill)
      fireEvent.change(inputFile, {target:{files:new File(['I am a test file'], "fileName.jpg")}})
      const isCorrectFormat = inputFile.getAttribute('data-correct-format')
      expect(isCorrectFormat).toBe('true')
    })


  })
})
