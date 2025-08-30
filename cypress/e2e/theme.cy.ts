/// <reference types="cypress" />

describe('Theme Toggle', () => {
  it('toggles theme on Auth page', () => {
    cy.visit('/auth');
    cy.get('[aria-label="Toggle dark mode"], [aria-label="Toggle dark mode" i]').first().click({ force: true });
    cy.get('html').should('have.class', 'dark');
  });

  it('toggles theme on Register page', () => {
    cy.visit('/register');
    cy.get('[aria-label="Toggle dark mode"], [aria-label="Toggle dark mode" i]').first().click({ force: true });
    cy.get('html').should('have.class', 'dark');
  });

  it('shows toggle in dashboard header', () => {
    // This assumes the user is authenticated; in CI you would mock or login first.
    cy.visit('/dashboard/overview');
    // Presence check
    cy.get('[aria-label="Toggle dark mode"]').should('exist');
  });
});
