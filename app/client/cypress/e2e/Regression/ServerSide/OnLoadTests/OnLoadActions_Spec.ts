import {
  agHelper,
  entityExplorer,
  propPane,
  deployMode,
  apiPage,
  locators,
  entityItems,
} from "../../../../support/Objects/ObjectsCore";

describe("Layout OnLoad Actions tests", function () {
  beforeEach(() => {
    agHelper.RestoreLocalStorageCache();
  });

  afterEach(() => {
    agHelper.SaveLocalStorageCache();
  });

  it("1. Bug 8595: OnPageLoad execution - when No api to run on Pageload", function () {
    cy.fixture("onPageLoadActionsDsl").then((val: any) => {
      agHelper.AddDsl(val);
    });
    entityExplorer.SelectEntityByName("Widgets");
    entityExplorer.SelectEntityByName("Page1");
    cy.url().then((url) => {
      const pageid = url.split("/")[5]?.split("-").pop();
      cy.log(pageid + "page id");
      cy.request("GET", "api/v1/pages/" + pageid).then((response) => {
        const respBody = JSON.stringify(response.body);
        const _emptyResp =
          JSON.parse(respBody).data.layouts[0].layoutOnLoadActions;
        expect(JSON.parse(JSON.stringify(_emptyResp))).to.deep.eq([]);
      });
    });
  });

  it("2. Bug 8595: OnPageLoad execution - when Query Parmas added via Params tab", function () {
    cy.fixture("onPageLoadActionsDsl").then((val: any) => {
      agHelper.AddDsl(val, locators._imageWidget);
    });
    apiPage.CreateAndFillApi(
      "https://source.unsplash.com/collection/1599413",
      "RandomFlora",
      30000,
    );
    //apiPage.RunAPI();

    apiPage.CreateAndFillApi("https://randomuser.me/api/", "RandomUser", 30000);
    //apiPage.RunAPI();

    apiPage.CreateAndFillApi(
      "https://favqs.com/api/qotd",
      "InspiringQuotes",
      30000,
    );
    apiPage.EnterHeader("dependency", "{{RandomUser.data}}"); //via Params tab
    //apiPage.RunAPI();

    apiPage.CreateAndFillApi(
      "https://www.boredapi.com/api/activity",
      "Suggestions",
      30000,
    );
    apiPage.EnterHeader("dependency", "{{InspiringQuotes.data}}");
    //apiPage.RunAPI();

    apiPage.CreateAndFillApi("https://api.genderize.io", "Genderize", 30000);
    apiPage.EnterParams("name", "{{RandomUser.data.results[0].name.first}}"); //via Params tab
    //apiPage.RunAPI();

    //Adding dependency in right order matters!
    entityExplorer.ExpandCollapseEntity("Widgets");
    entityExplorer.SelectEntityByName("Image1");
    propPane.UpdatePropertyFieldValue("Image", `{{RandomFlora.data}}`);

    entityExplorer.SelectEntityByName("Image2");
    propPane.UpdatePropertyFieldValue(
      "Image",
      `{{RandomUser.data.results[0].picture.large}}`,
    );

    entityExplorer.SelectEntityByName("Text1");
    propPane.UpdatePropertyFieldValue(
      "Text",
      `{{InspiringQuotes.data.quote.body}}\n--\n{{InspiringQuotes.data.quote.author}}\n`,
    );

    entityExplorer.SelectEntityByName("Text2");
    propPane.UpdatePropertyFieldValue(
      "Text",
      `Hi, here is {{RandomUser.data.results[0].name.first}} & I'm {{RandomUser.data.results[0].dob.age}}'yo\nI live in {{RandomUser.data.results[0].location.country}}\nMy Suggestion : {{Suggestions.data.activity}}\n\nI'm {{Genderize.data.gender}}`,
    );

    // cy.url().then((url) => {
    //   const pageid = url.split("/")[4]?.split("-").pop();
    //   cy.log(pageid + "page id");
    //   cy.request("GET", "api/v1/pages/" + pageid).then((response) => {
    //     const respBody = JSON.stringify(response.body);

    //     const _randomFlora = JSON.parse(respBody).data.layouts[0]
    //       .layoutOnLoadActions[0];
    //     const _randomUser = JSON.parse(respBody).data.layouts[0]
    //       .layoutOnLoadActions[1];
    //     const _genderize = JSON.parse(respBody).data.layouts[0]
    //       .layoutOnLoadActions[2];
    //     const _suggestions = JSON.parse(respBody).data.layouts[0]
    //       .layoutOnLoadActions[3];
    //     // cy.log("_randomFlora is: " + JSON.stringify(_randomFlora))
    //     // cy.log("_randomUser is: " + JSON.stringify(_randomUser))
    //     // cy.log("_genderize is: " + JSON.stringify(_genderize))
    //     // cy.log("_suggestions is: " + JSON.stringify(_suggestions))

    //     expect(JSON.parse(JSON.stringify(_randomFlora))[0]["name"]).to.eq(
    //       "RandomFlora",
    //     );
    //     expect(JSON.parse(JSON.stringify(_randomUser))[0]["name"]).to.eq(
    //       "RandomUser",
    //     );
    //     expect(JSON.parse(JSON.stringify(_genderize))[0]["name"]).to.be.oneOf([
    //       "Genderize",
    //       "InspiringQuotes",
    //     ]);
    //     expect(JSON.parse(JSON.stringify(_genderize))[1]["name"]).to.be.oneOf([
    //       "Genderize",
    //       "InspiringQuotes",
    //     ]);
    //     expect(JSON.parse(JSON.stringify(_suggestions))[0]["name"]).to.eq(
    //       "Suggestions",
    //     );
    //   });
    // });

    deployMode.DeployApp(locators._widgetInDeployed("textwidget"), false);
    agHelper.Sleep(5000); //for all api's to ccomplete call!
    cy.wait("@viewPage").then(($response) => {
      const respBody = JSON.stringify($response.response?.body);

      const _randomFlora =
        JSON.parse(respBody).data.layouts[0].layoutOnLoadActions[0];
      const _randomUser =
        JSON.parse(respBody).data.layouts[0].layoutOnLoadActions[1];
      const _genderize =
        JSON.parse(respBody).data.layouts[0].layoutOnLoadActions[2];
      const _suggestions =
        JSON.parse(respBody).data.layouts[0].layoutOnLoadActions[3];
      // cy.log("_randomFlora is: " + JSON.stringify(_randomFlora))
      // cy.log("_randomUser is: " + JSON.stringify(_randomUser))
      // cy.log("_genderize is: " + JSON.stringify(_genderize))
      // cy.log("_suggestions is: " + JSON.stringify(_suggestions))

      expect(JSON.parse(JSON.stringify(_randomFlora))[0]["name"]).to.eq(
        "RandomFlora",
      );
      expect(JSON.parse(JSON.stringify(_randomUser))[0]["name"]).to.eq(
        "RandomUser",
      );
      expect(JSON.parse(JSON.stringify(_genderize))[0]["name"]).to.be.oneOf([
        "Genderize",
        "InspiringQuotes",
      ]);
      expect(JSON.parse(JSON.stringify(_genderize))[1]["name"]).to.be.oneOf([
        "Genderize",
        "InspiringQuotes",
      ]);
      expect(JSON.parse(JSON.stringify(_suggestions))[0]["name"]).to.eq(
        "Suggestions",
      );
    });

    deployMode.NavigateBacktoEditor();
    //Verify if debugger is closed after failure of onpageload actions.issue #22283
    agHelper.AssertElementAbsence(locators._errorTab);
  });

  it("3. Bug 10049, 10055: Dependency not executed in expected order in layoutOnLoadActions when dependency added via URL", function () {
    entityExplorer.SelectEntityByName("Genderize", "Queries/JS");
    entityExplorer.ActionContextMenuByEntityName({
      entityNameinLeftSidebar: "Genderize",
      action: "Delete",
      entityType: entityItems.Api,
    });

    apiPage.CreateAndFillApi(
      "https://api.genderize.io?name={{RandomUser.data.results[0].name.first}}",
      "Genderize",
      30000,
    );
    apiPage.ValidateQueryParams({
      key: "name",
      value: "{{RandomUser.data.results[0].name.first}}",
    }); // verifies Bug 10055

    deployMode.DeployApp(locators._widgetInDeployed("textwidget"), false);
    agHelper.Sleep(5000); //for all api's to ccomplete call!
    cy.wait("@viewPage").then(($response) => {
      const respBody = JSON.stringify($response.response?.body);
      const _randomFlora =
        JSON.parse(respBody).data.layouts[0].layoutOnLoadActions[0];
      const _randomUser =
        JSON.parse(respBody).data.layouts[0].layoutOnLoadActions[1];
      const _genderize =
        JSON.parse(respBody).data.layouts[0].layoutOnLoadActions[2];
      const _suggestions =
        JSON.parse(respBody).data.layouts[0].layoutOnLoadActions[3];

      expect(JSON.parse(JSON.stringify(_randomFlora))[0]["name"]).to.eq(
        "RandomFlora",
      );
      expect(JSON.parse(JSON.stringify(_randomUser))[0]["name"]).to.eq(
        "RandomUser",
      );
      expect(JSON.parse(JSON.stringify(_genderize))[0]["name"]).to.be.oneOf([
        "Genderize",
        "InspiringQuotes",
      ]);
      expect(JSON.parse(JSON.stringify(_genderize))[1]["name"]).to.be.oneOf([
        "Genderize",
        "InspiringQuotes",
      ]);
      expect(JSON.parse(JSON.stringify(_suggestions))[0]["name"]).to.eq(
        "Suggestions",
      );
    });
  });
});
