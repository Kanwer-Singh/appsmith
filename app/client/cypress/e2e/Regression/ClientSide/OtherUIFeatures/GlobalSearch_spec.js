/* eslint-disable cypress/no-unnecessary-waiting */
const commonlocators = require("../../../../locators/commonlocators.json");
const dsl = require("../../../../fixtures/MultipleWidgetDsl.json");
const globalSearchLocators = require("../../../../locators/GlobalSearch.json");
const datasourceHomeLocators = require("../../../../locators/apiWidgetslocator.json");
const datasourceLocators = require("../../../../locators/DatasourcesEditor.json");
import * as _ from "../../../../support/Objects/ObjectsCore";

describe("GlobalSearch", function () {
  before(() => {
    cy.fixture("MultipleWidgetDsl").then((val) => {
      _.agHelper.AddDsl(val);
    });
  });

  beforeEach(() => {
    cy.startRoutesForDatasource();
  });

  it("1. Clicking on filter should show the filter menu", () => {
    cy.get(commonlocators.globalSearchTrigger).click({ force: true });
    cy.contains(globalSearchLocators.docHint, "snippets").click();
    cy.get(globalSearchLocators.filterButton).click();
    cy.contains("Reset Filter").should("be.visible");
    cy.get("body").type("{esc}");

    //showsAndHidesUsingKeyboardShortcuts
    // wait for the page to load
    cy.get(commonlocators.canvas);
    const isMac = Cypress.platform === "darwin";
    if (isMac) {
      cy.get("body").type("{cmd}{k}");
      cy.get(commonlocators.globalSearchModal);
      cy.get("body").type("{esc}");
      cy.get(commonlocators.globalSearchModal).should("not.exist");
    } else {
      cy.get("body").type("{ctrl}{k}");
      cy.get(commonlocators.globalSearchModal);
      cy.get("body").type("{esc}");
      cy.get(commonlocators.globalSearchModal).should("not.exist");
    }
  });

  it("2. selectsWidget", () => {
    const table = dsl.dsl.children[2];
    cy.get(commonlocators.globalSearchTrigger).click({ force: true });
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get(commonlocators.globalSearchInput).type(table.widgetName);
    cy.get("body").type("{enter}");
    cy.window()
      .its("store")
      .invoke("getState")
      .then((state) => {
        const { lastSelectedWidget } = state.ui.widgetDragResize;
        expect(lastSelectedWidget).to.be.equal(table.widgetId);
      });
  });

  it("3. navigatesToApi", () => {
    cy.NavigateToAPI_Panel();
    cy.CreateAPI("SomeApi");

    cy.get(commonlocators.globalSearchTrigger).click({ force: true });
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get(commonlocators.globalSearchInput).type("Page1");
    cy.get("body").type("{enter}");

    cy.get(commonlocators.globalSearchTrigger).click({ force: true });
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get(commonlocators.globalSearchInput).type("SomeApi");
    cy.get("body").type("{enter}");
    cy.window()
      .its("store")
      .invoke("getState")
      .then((state) => {
        const { actions } = state.entities;
        const expectedAction = actions.find(
          (actions) => actions.config.name === "SomeApi",
        );
        cy.location().should((loc) => {
          expect(loc.pathname).includes(expectedAction.config.id);
        });
      });
  });

  it("4. navigatesToDatasourceHavingAQuery", () => {
    cy.createPostgresDatasource();
    cy.get("@saveDatasource").then((httpResponse) => {
      const expectedDatasource = httpResponse.response.body.data;

      cy.NavigateToActiveDSQueryPane(expectedDatasource.name);
      cy.get(commonlocators.globalSearchTrigger).click({ force: true });
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000); // modal open transition should be deterministic
      cy.get(commonlocators.globalSearchInput).type("Page1");
      cy.get("body").type("{enter}");

      cy.get(commonlocators.globalSearchTrigger).click({ force: true });
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000); // modal open transition should be deterministic
      cy.get(commonlocators.globalSearchInput).type(expectedDatasource.name);
      cy.get("body").type("{enter}");
      cy.location().should((loc) => {
        expect(loc.pathname).includes(expectedDatasource.id);
      });
    });
  });

  it("5. navigatesToPage", () => {
    cy.Createpage("NewPage");
    cy.get(commonlocators.globalSearchTrigger).click({ force: true });
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get(commonlocators.globalSearchInput).type("Page1");
    cy.get("body").type("{enter}");
    cy.window()
      .its("store")
      .invoke("getState")
      .then((state) => {
        const { pages } = state.entities.pageList;
        const expectedPage = pages.find((page) => page.pageName === "Page1");
        cy.location().should((loc) => {
          expect(loc.pathname).includes(expectedPage.pageId);
        });
      });
  });

  it("6. Shortcuts should get triggered when the modal is open", () => {
    cy.get(commonlocators.globalSearchTrigger).click({ force: true });
    const isMac = Cypress.platform === "darwin";
    if (isMac) {
      cy.get("body").type("{cmd}{p}");
      cy.get(globalSearchLocators.category).should("be.visible");
      cy.get("body").type("{esc}");
      cy.get(commonlocators.globalSearchModal).should("not.exist");
    } else {
      cy.get("body").type("{ctrl}{p}");
      cy.get(globalSearchLocators.category).should("be.visible");
      cy.get("body").type("{esc}");
      cy.get(commonlocators.globalSearchModal).should("not.exist");
    }
  });

  it("7. Api actions should have API as prefix", () => {
    cy.get(globalSearchLocators.createNew).click({ force: true });
    cy.get(globalSearchLocators.blankDatasource).first().click({ force: true });
    cy.get(datasourceHomeLocators.createAuthApiDatasource).click();
    cy.get(datasourceLocators.datasourceTitleLocator).click();
    cy.get(`${datasourceLocators.datasourceTitleLocator} input`)
      .clear()
      .type("omnibarApiDatasource", { force: true })
      .blur();

    cy.fillAuthenticatedAPIForm();
    cy.saveDatasource();

    cy.get(globalSearchLocators.createNew).click({ force: true });
    cy.get(".ads-v2-menu__menu-item span:contains('omnibarApiDatasource')")
      .first()
      .click();
    cy.wait("@createNewApi");
    cy.get(datasourceHomeLocators.apiTxt)
      .invoke("val")
      .then((title) => expect(title).includes("Api"));
  });

  // since now datasource will only be saved once user clicks on save button explicitly,
  // updated test so that when user clicks on google sheet and searches for the same datasource, no
  // results found will be shown
  it(
    "excludeForAirgap",
    "8. navigatesToGoogleSheetsQuery does not break again: Bug 15012",
    () => {
      cy.createGoogleSheetsDatasource();
      cy.renameDatasource("XYZ");
      cy.wait(4000);

      cy.get(commonlocators.globalSearchTrigger).click({ force: true });
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000); // modal open transition should be deterministic
      cy.get(commonlocators.globalSearchInput).type("XYZ");

      cy.get(".no-data-title").should("be.visible");
    },
  );
});
