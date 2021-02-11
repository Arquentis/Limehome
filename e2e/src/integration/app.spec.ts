// import { getGreeting } from '../support/app.po';

describe('Limehome', () => {
  beforeEach(() => cy.visit('/'));

  it('should have nav', () => {
    cy.get('nav')
        .should("be.visible");

        cy.get("nav img").should("have.attr.src", "/assets/images/svg/logo.svg");
  });
});