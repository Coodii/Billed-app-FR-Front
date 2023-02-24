/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import userEvent from '@testing-library/user-event'
import BillsContainer from  "../containers/Bills.js"

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      const WindowIconClass = windowIcon.getAttribute("class")
      expect(WindowIconClass).toEqual("active-icon")

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })


    // test d'intégration GET
    describe("When I navigate to Bills", () => {
      test("fetches bills from mock API GET", async () => {
        localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
        const myBills = screen.getByText("Mes notes de frais")
        expect(myBills).toBeTruthy()
        const newBillButton = screen.getByText('Nouvelle note de frais')
        expect(newBillButton).toBeTruthy()
      })
    })

    describe('When I click on icon eye', () => {
      test('A modale should be opened', async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null
        document.body.innerHTML = BillsUI({data: bills})
        const billToTest = new BillsContainer({
          document, onNavigate, store, localStorage: window.localStorage
        })
        $.fn.modal = jest.fn()
        const eyeList = screen.getAllByTestId('icon-eye')
        const eye = eyeList[0]
        const handleClickIconEye = jest.fn(billToTest.handleClickIconEye(eye))
        eye.addEventListener('click', handleClickIconEye)
        userEvent.click(eye)
        expect(handleClickIconEye).toHaveBeenCalled()
        const modale =document.querySelector('#modaleFile')
        expect(modale).toBeTruthy()
      })})

      describe('When I click on new bills',  () => {
        test('New bill page should open', async () => {
          Object.defineProperty(window, 'localStorage', { value: localStorageMock })
          localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
          const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname })
          }
          const store = null
          document.body.innerHTML = BillsUI({ data: bills })
          const billToTest = new BillsContainer({
            document, onNavigate, store, localStorage: window.localStorage
          })
          const handleClickNewBill = jest.fn(billToTest.handleClickNewBill)
          const newBillButton = screen.getByTestId('btn-new-bill')
          newBillButton.addEventListener('click', handleClickNewBill)
          userEvent.click(newBillButton)
          const expenseName = screen.getByText("Nom de la dépense")
          expect(expenseName).toBeTruthy()
        })
      })
  })})
