import { REPO, CURRENT_REPO } from "../../../../fixtures/REPO";
import homePageLocators from "../../../../locators/HomePage";
import { agHelper, homePage } from "../../../../support/Objects/ObjectsCore";
const commonlocators = require("../../../../locators/commonlocators.json");

describe("Export application as a JSON file", function () {
  let workspaceId;
  let appid;
  let appname;

  before(() => {
    cy.fixture("displayWidgetDsl").then((val) => {
      agHelper.AddDsl(val);
    });
  });

  it("1. Check if exporting app flow works as expected", function () {
    cy.get(commonlocators.homeIcon).click({ force: true });
    appname = localStorage.getItem("AppName");
    cy.get(homePageLocators.searchInput).type(appname);
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // cy.get(homePageLocators.applicationCard).first().trigger("mouseover");
    cy.get(homePageLocators.appMoreIcon).first().click({ force: true });
    cy.get(homePageLocators.exportAppFromMenu).click({ force: true });
    agHelper.ValidateToastMessage("Successfully exported");
    // fetching the exported app file manually to be verified.
    cy.get(`a[id=t--export-app-link]`).then((anchor) => {
      const url = anchor.prop("href");
      cy.request(url).then(({ headers }) => {
        expect(headers).to.have.property("content-type", "application/json");
        expect(headers)
          .to.have.property("content-disposition")
          .that.includes("attachment;")
          .and.includes(`filename*=UTF-8''${appname}.json`);
      });
    });
    cy.LogOut();
  });

  it("2. User with admin access,should be able to export the app", function () {
    if (CURRENT_REPO === REPO.CE) {
      cy.LogintoApp(Cypress.env("USERNAME"), Cypress.env("PASSWORD"));
      homePage.NavigateToHome();
      agHelper.GenerateUUID();
      cy.get("@guid").then((uid) => {
        homePage.CreateNewWorkspace("exportApp" + uid);
        homePage.CreateAppInWorkspace("exportApp" + uid, "App" + uid);
        appid = "App" + uid;
        //cy.get("h2").contains("Drag and drop a widget here");
        cy.get(homePageLocators.shareApp).click({ force: true });
        // cy.shareApp(Cypress.env("TESTUSERNAME1"), homePageLocators.adminRole);
        homePage.InviteUserToApplication(
          Cypress.env("TESTUSERNAME1"),
          "Administrator",
        );
        cy.LogOut();

        cy.LogintoApp(
          Cypress.env("TESTUSERNAME1"),
          Cypress.env("TESTPASSWORD1"),
        );
        cy.wait(2000);
        cy.log({ appid });
        cy.get(homePageLocators.searchInput).type(appid);
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(2000);

        //cy.get(homePageLocators.applicationCard).first().trigger("mouseover");
        cy.get(homePageLocators.appMoreIcon).first().click({ force: true });
        cy.get(homePageLocators.exportAppFromMenu).should("be.visible");
        cy.xpath(homePageLocators.workspaceHeading).click({ force: true });
        cy.get(homePageLocators.applicationCard).first().trigger("mouseover");
        cy.get(homePageLocators.appEditIcon).first().click({ force: true });
        cy.get(homePageLocators.applicationName).click({ force: true });
        cy.contains("Export application").should("be.visible");
      });
      cy.LogOut();
    }
  });

  it("3. User with developer access,should not be able to export the app", function () {
    cy.LogintoApp(Cypress.env("USERNAME"), Cypress.env("PASSWORD"));
    homePage.NavigateToHome();
    agHelper.GenerateUUID();
    cy.get("@guid").then((uid) => {
      homePage.CreateNewWorkspace("exportApp" + uid);
      homePage.CreateAppInWorkspace("exportApp" + uid, "App" + uid);
      appid = "App" + uid;
      workspaceId = "exportApp" + uid;
      //cy.get("h2").contains("Drag and drop a widget here");
      cy.get(homePageLocators.shareApp).click({ force: true });
      homePage.InviteUserToApplication(
        Cypress.env("TESTUSERNAME1"),
        "Developer",
      );

      cy.LogOut();

      cy.LogintoApp(Cypress.env("TESTUSERNAME1"), Cypress.env("TESTPASSWORD1"));
      cy.wait(2000);
      cy.log({ appid });
      cy.get(homePageLocators.searchInput).type(appid);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(2000);
      cy.get(homePageLocators.appMoreIcon).first().click({ force: true });
      cy.get(homePageLocators.exportAppFromMenu).should("not.exist");
      cy.xpath(homePageLocators.workspaceHeading).click({ force: true });
      cy.get(homePageLocators.applicationCard).first().trigger("mouseover");
      cy.get(homePageLocators.appEditIcon).first().click({ force: true });
      cy.get(homePageLocators.applicationName).click({ force: true });
      cy.contains("Export application").should("not.exist");
    });
    cy.LogOut();
  });

  it("4. User with viewer access,should not be able to export the app", function () {
    homePage.LogintoApp(Cypress.env("USERNAME"), Cypress.env("PASSWORD"));
    homePage.NavigateToHome();
    agHelper.GenerateUUID();
    cy.get("@guid").then((uid) => {
      homePage.CreateNewWorkspace("exportApp" + uid);
      homePage.CreateAppInWorkspace("exportApp" + uid, "App" + uid);
      appid = "App" + uid;
      workspaceId = "exportApp" + uid;
      //cy.get("h2").contains("Drag and drop a widget here");
      cy.get(homePageLocators.shareApp).click({ force: true });

      homePage.InviteUserToApplication(
        Cypress.env("TESTUSERNAME1"),
        "App Viewer",
      );
      cy.LogOut();

      cy.LogintoApp(Cypress.env("TESTUSERNAME1"), Cypress.env("TESTPASSWORD1"));
      cy.wait(2000);
      cy.log({ appid });
      cy.get(homePageLocators.searchInput).type(appid);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(2000);

      cy.get(homePageLocators.applicationCard).first().trigger("mouseover");
      cy.get(homePageLocators.appEditIcon).should("not.exist");
    });
    cy.LogOut();
  });
});
