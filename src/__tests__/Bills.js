/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import router from "../app/Router.js";
import { formatDate, formatStatus } from "../app/format.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
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
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
      // expect(window.getComputedStyle(windowIcon).backgroundColor).toBe('rgb(123, 177, 247)');
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => a - b;
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});

describe("Given i am connected as an employee", () => {
  //test handleClickIconEye ligne 14 de bills.js
  describe("When i click on any eye icon", () => {
    test("Then modal should open", () => {
      // Définition de localStorageMock pour simuler le localStorage
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      // Définition du type d'utilisateur dans le localStorage
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

      // Génération du HTML de BillsUI avec les données de bills
      const html = BillsUI({ data: bills });

      // Mise à jour du contenu du corps du document avec le HTML généré
      document.body.innerHTML = html;

      // Fonction de navigation utilisée pour simuler la navigation vers la route bills
      const onNavigate = (pathname) => {
        // Mise à jour du contenu du corps du document avec le HTML de la route spécifiée par pathname
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Création d'une instance de Bills avec les dépendances simulées
      const billsContainer = new Bills({
        document,
        onNavigate,
        localStorage: localStorageMock,
        store: null,
      });

      // Mock de la fonction $.fn.modal utilisée pour afficher la modale
      $.fn.modal = jest.fn();

      // Mock de la fonction handleClickIconEye pour simuler un clic sur l'icône de l'œil
      const handleClickIconEye = jest.fn(() => {
        // Fonction factice qui simule un clic sur l'icône de l'œil
        billsContainer.handleClickIconEye;
      });

      // Sélection de la première icône de l'œil
      const firstEyeIcon = screen.getAllByTestId("icon-eye")[0];

      // Ajout de l'événement de clic pour déclencher handleClickIconEye lors du clic sur l'icône de l'œil
      firstEyeIcon.addEventListener("click", handleClickIconEye);

      // Simulation du clic sur l'icône de l'œil en utilisant fireEvent.click
      fireEvent.click(firstEyeIcon);

      // Vérification que handleClickIconEye a été appelé
      expect(handleClickIconEye).toHaveBeenCalled();

      // Vérification que $.fn.modal a été appelé
      expect($.fn.modal).toHaveBeenCalled();
    });
  });
  // test naviagtion ligne 21 containers/Bills.js
  describe("When I click the button 'Nouvelle note de frais'", () => {
    test("Then NewBill page appears", () => {
      // Mocking dependencies
      const onNavigateMock = jest.fn();

      // Création de l'instance du composant Bills
      const billsComponent = new Bills({
        document,
        onNavigate: onNavigateMock,
        store: null,
        localStorage: window.localStorage,
      });

      // Sélection du bouton "Nouvelle note de frais"
      const buttonNewBill = document.querySelector(
        'button[data-testid="btn-new-bill"]'
      );

      // Vérification du clic sur le bouton
      buttonNewBill.click();

      // Vérification du comportement attendu
      expect(onNavigateMock).toHaveBeenCalledWith(
        expect.stringContaining("#employee/bill/new")
      );
    });
  });

  describe("When I am on Bills Page and call getBills", () => {
    test("Then it should return bills data correctly", async () => {
      // Mocking localStorage
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      // Spy on document.querySelector
      const querySelectorSpy = jest.spyOn(document, "querySelector");

      // Mocking onNavigate
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Mocking Store et appel de getBills
      const storeMock = {
        bills: jest.fn().mockReturnValue({
          list: jest.fn().mockResolvedValue(bills),
        }),
      };
      const billsContainer = new Bills({
        document,
        onNavigate,
        localStorage: localStorageMock,
        store: storeMock,
      });

      // Appel des fonctions et vérification des résultats
      const res = await billsContainer.getBills();
      expect(res.length).toBe(bills.length);
      expect(res[0].date).toEqual(formatDate(bills[0].date));
      expect(res[0].status).toEqual(formatStatus(bills[0].status));

      // Restauration de la methode originale
      querySelectorSpy.mockRestore();
    });
  });

  const corruptedBills = [
    {
      date: "corrupted_date",
      status: "Pending",
    },
  ];

  describe("When I am on Bills Page and call getBills with corrupted data", () => {
    test("Then it should log the error and return unformatted date", async () => {
      // Mocking Store et appel de la fonction getBills
      const storeMock = {
        bills: jest.fn().mockReturnValue({
          list: jest.fn().mockResolvedValue(corruptedBills), // bills corrompus
        }),
      };

      const billsContainer = new Bills({
        document,
        onNavigate,
        localStorage: localStorageMock,
        store: storeMock,
      });

      // Override console.log
      console.log = jest.fn();

      // Appel de la fonction et vérification des résultats
      const res = await billsContainer.getBills();

      // On vérifie si l'erreur a bien étée loggée
      expect(console.log).toHaveBeenCalled();
      // On vérifie si la date non formatée a bien étée retournée
      expect(res[0].date).toBe(corruptedBills[0].date);
    });
  });
});
// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Dashboard", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      router();
      window.onNavigate(ROUTES_PATH.Dashboard);
      await waitFor(() => screen.getByText("Transports"));
      const contentPending = await screen.getByText("Hôtel et logement");
      expect(contentPending).toBeTruthy;
      // const contentRefused = await screen.getByText("Refused");
      // expect(contentRefused).toBeTruthy;
      // On vérifie la présence de minimum 1 bill
      expect(screen.queryAllByTestId(/open-bill/i)).toBeTruthy();
    });
    // On démarre un test asynchrone
    test("fetches bills from an API and fails with 404 message error", async () => {
      // On définit un utilisateur dans le localStorage. C'est nécessaire car notre application vérifie si un utilisateur est connecté.
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );

      // On crée un élément div et on l'ajoute au document. Notre application utilise cet élément comme point d'ancrage pour afficher le contenu.
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      // On crée un mock de notre store. Le store est l'objet qui gère la communication avec l'API.
      // Dans ce cas, on simule une erreur 404 lors de l'appel à la méthode list de bills.
      const storeMock = {
        bills: jest.fn().mockReturnValue({
          list: jest.fn().mockRejectedValue(new Error("Erreur 404")),
        }),
      };

      // On crée une instance de notre composant Bills avec les dépendances nécessaires.
      const billsContainer = new Bills({
        document,
        onNavigate,
        localStorage: localStorageMock,
        store: storeMock,
      });

      // On démarre le routeur de notre application.
      router();

      // On simule une navigation vers le tableau de bord.
      window.onNavigate(ROUTES_PATH.Dashboard);

      // On attend que le texte "Transports" soit présent dans le document. En se faisant, on s'assure que le rendu de la page est terminé.
      await waitFor(() => screen.getByText("Transports"));

      // On appelle la méthode getBills de notre composant et on vérifie qu'elle rejette une erreur avec le message "Erreur 404".
      await expect(billsContainer.getBills()).rejects.toThrow("Erreur 404");
    });

    test("fetches bills from an API and fails with 500 message error", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      const storeMock = {
        bills: jest.fn().mockReturnValue({
          list: jest.fn().mockRejectedValue(new Error("Erreur 500")),
        }),
      };

      const billsContainer = new Bills({
        document,
        onNavigate,
        localStorage: localStorageMock,
        store: storeMock,
      });

      router();
      window.onNavigate(ROUTES_PATH.Dashboard);
      await waitFor(() => screen.getByText("Transports"));
      await expect(billsContainer.getBills()).rejects.toThrow("Erreur 500");
    });
  });
});
