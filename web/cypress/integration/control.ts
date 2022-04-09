/// <reference types="cypress" />

// Welcome to Cypress!
//
// This spec file contains a variety of sample tests
// for a todo list app that are designed to demonstrate
// the power of writing tests in Cypress.
//
// To learn more about how Cypress works and
// what makes it such an awesome testing tool,
// please read our getting started guide:
// https://on.cypress.io/introduction-to-cypress
import { WebSocket, Server } from "mock-socket";
import opmodes from "../fixtures/opmodes.json";
import status from "../fixtures/status.json";

describe("Basic Interaction", () => {
  const server = new Server("ws://localhost:4000/custom");
  server.on("connection", (ws) => {
    console.log("connection");
    ws.on("message", (message) => {
      const decoded = JSON.parse(message as string);
      switch (decoded.type) {
        case "joinroom":
          ws.send(JSON.stringify(opmodes));
          ws.send(JSON.stringify(status.warning));
          ws.send(JSON.stringify(status.error));
          break;
        case "INIT_OPMODE":
          ws.send(JSON.stringify(status.init));
          ws.send(JSON.stringify(status.nonerror));
          break;
        case "START_OPMODE":
          ws.send(JSON.stringify(status.started));
          ws.send(JSON.stringify(status.error));
          ws.send(JSON.stringify(status.nonwarning));
          break;
        case "STOP_OPMODE":
          ws.send(JSON.stringify(status.stop));
          break;
      }
    });
  });
  it("joins a room", () => {
    cy.visit("http://localhost:3000", {
      onBeforeLoad: (win) => {
        cy.stub(win, "WebSocket").callsFake((url) => new WebSocket(url));
      },
    });
    expect(localStorage.getItem("prevCodes")).to.be.null;
    cy.get('[href="#/control"]').click();
    cy.get("#formRoomCode").type("Test Room Code");
    cy.get(".btn")
      .click()
      .should(() => {
        expect(localStorage.getItem("prevCodes")).to.be.eq(
          JSON.stringify(["Test Room Code"])
        );
      });
  });
  it("selects opmodes", () => {
    cy.waitFor(".form-select");
    cy.get(".invalid-feedback").should("not.be.visible");
    cy.get(".form-select").select(1);
    cy.contains("Warning").should("be.visible");
    cy.contains("Error").should("be.visible");
    cy.contains("Init").click();
    cy.contains("Warning").should("be.visible");
    cy.contains("Error").should("not.exist");
    cy.contains("Start").click();
    cy.contains("Start").should("be.disabled");
    cy.contains("Warning").should("not.exist");
    cy.contains("Error").should("be.visible");
    cy.contains("Stop").click();
    cy.get(".invalid-feedback").should("be.visible");
  });
  it("applies filters", () => {
    cy.get(".form-select").find("option").should("have.length", 33);
    cy.get(".card-header > .btn").click();
    cy.get("#teleop-switch").click();
    cy.contains("Apply Temporarily").click();
    cy.get(".form-select").find("option").should("have.length", 27);
  });
  it("saves filters", () => {
    expect(localStorage.getItem("filter")).to.be.null;
    cy.get(".card-header > .btn").click();
    cy.contains("Save Permanently")
      .click()
      .should(() => {
        expect(localStorage.getItem("filter")).to.be.eq(
          JSON.stringify({
            flavor: { TELEOP: true, AUTONOMOUS: false },
            groups: [],
          })
        );
      });
  });
});
