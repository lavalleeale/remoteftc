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
  it("displays two todo items by default", () => {
    const server = new Server("ws://localhost:4000/custom");
    server.on("connection", (ws) => {
      console.log("connection");
      ws.on("message", (message) => {
        const decoded = JSON.parse(message as string);
        console.log(decoded);
        switch (decoded.type) {
          case "joinroom":
            ws.send(JSON.stringify(opmodes));
            ws.send(JSON.stringify(status.start));
            break;
          case "INIT_OPMODE":
            ws.send(JSON.stringify(status.init));
            break;
          case "START_OPMODE":
            ws.send(JSON.stringify(status.started));
            break;
          case "STOP_OPMODE":
            ws.send(JSON.stringify(status.start));
            break;
        }
      });
    });
    cy.visit("http://localhost:3000", {
      onBeforeLoad: (win) => {
        cy.stub(win, "WebSocket").callsFake((url) => new WebSocket(url));
      },
    });
    cy.get('[href="#/control"]').click();
    cy.wait(1000);
    cy.get("#formRoomCode").type("111111");
    cy.get(".btn").click();
    cy.waitFor(".form-select");
    cy.get(".invalid-feedback").should("not.be.visible");
    cy.get(".form-select").select(1);
    cy.contains("Init").click();
    cy.contains("Start").click();
    cy.contains("Stop").click();
    cy.get(".invalid-feedback").should("be.visible");
  });
});
