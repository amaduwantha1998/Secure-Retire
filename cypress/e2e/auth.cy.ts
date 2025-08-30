/// <reference types="cypress" />

describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('displays the auth page correctly', () => {
    // Check that the page loads with correct elements
    cy.get('[data-testid="logo"]').should('be.visible');
    cy.contains('Sign in to your account or create a new one').should('be.visible');
    
    // Check that tabs are present
    cy.get('[role="tab"]').contains('Sign In').should('be.visible');
    cy.get('[role="tab"]').contains('Sign Up').should('be.visible');
    
    // Check that theme toggle is present (but not notifications)
    cy.get('[aria-label="Toggle dark mode"]').should('be.visible');
    
    // Check that notification dropdown is NOT present
    cy.get('[data-testid="notification-dropdown"]').should('not.exist');
  });

  it('validates email/password sign in form', () => {
    // Test email validation
    cy.get('#email').type('invalid-email');
    cy.get('#password').type('password123');
    cy.get('[aria-label="Sign in to your account"]').click();
    
    // Should show validation error
    cy.get('[role="alert"]').should('contain', 'Invalid email');
    
    // Test with valid email
    cy.get('#email').clear().type('test@example.com');
    cy.get('[aria-label="Sign in to your account"]').click();
    
    // Should attempt login (will fail in cypress but form validation passes)
    cy.get('#email').should('have.value', 'test@example.com');
  });

  it('validates sign up form', () => {
    // Switch to sign up tab
    cy.get('[role="tab"]').contains('Sign Up').click();
    
    // Fill out form with validation errors
    cy.get('#signupEmail').type('test@example.com');
    cy.get('#signupPassword').type('weak');
    cy.get('#confirmPassword').type('different');
    cy.get('[aria-label="Create new account"]').click();
    
    // Should show password validation error
    cy.get('[role="alert"]').should('be.visible');
    
    // Test with matching passwords
    cy.get('#fullName').type('Test User');
    cy.get('#signupPassword').clear().type('StrongPassword123!');
    cy.get('#confirmPassword').clear().type('StrongPassword123!');
    
    // Form should now be ready for submission
    cy.get('#fullName').should('have.value', 'Test User');
    cy.get('#signupEmail').should('have.value', 'test@example.com');
  });

  it('shows remember me checkbox and forgot password link', () => {
    // Check remember me checkbox exists
    cy.get('#remember').should('exist');
    cy.get('label[for="remember"]').should('contain', 'Remember me');
    
    // Check forgot password link exists
    cy.contains('Forgot Password').should('be.visible');
  });

  it('toggles password visibility', () => {
    // Password should be hidden initially
    cy.get('#password').should('have.attr', 'type', 'password');
    
    // Click show password button
    cy.get('[aria-label="Show password"]').click();
    cy.get('#password').should('have.attr', 'type', 'text');
    
    // Click hide password button
    cy.get('[aria-label="Hide password"]').click();
    cy.get('#password').should('have.attr', 'type', 'password');
  });

  it('does not show phone authentication options', () => {
    // Check that phone-related elements are not present
    cy.contains('Sign in with Phone').should('not.exist');
    cy.get('[placeholder*="phone"]').should('not.exist');
    cy.get('input[type="tel"]').should('not.exist');
  });

  it('does not show OAuth options', () => {
    // Check that OAuth buttons are not present
    cy.contains('Google').should('not.exist');
    cy.contains('Apple').should('not.exist');
    cy.get('[aria-label="Sign in with Google"]').should('not.exist');
    cy.get('[aria-label="Sign in with Apple"]').should('not.exist');
  });

  it('has proper accessibility features', () => {
    // Check ARIA labels
    cy.get('[aria-label="Sign in to your account"]').should('exist');
    cy.get('[aria-label="Create new account"]').should('exist');
    cy.get('[aria-label="Show password"]').should('exist');
    
    // Check form labels are properly associated
    cy.get('#email').should('have.attr', 'aria-describedby', 'email-error');
    cy.get('#password').should('have.attr', 'aria-describedby', 'password-error');
    
    // Check tab navigation works
    cy.get('#email').focus();
    cy.focused().should('have.id', 'email');
    cy.focused().tab();
    cy.focused().should('have.id', 'password');
  });

  it('navigates back to home page', () => {
    cy.get('[aria-label*="Home"]').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('switches theme correctly', () => {
    // Test theme toggle functionality
    cy.get('html').should('not.have.class', 'dark');
    cy.get('[aria-label="Toggle dark mode"]').click({ force: true });
    cy.get('html').should('have.class', 'dark');
    cy.get('[aria-label="Toggle dark mode"]').click({ force: true });
    cy.get('html').should('not.have.class', 'dark');
  });

  it('maintains glass morphism styling in both themes', () => {
    // Check light theme glass styling
    cy.get('.glass-enhanced').should('be.visible');
    cy.get('.glass-btn-primary').should('be.visible');
    
    // Switch to dark theme and check styling persists
    cy.get('[aria-label="Toggle dark mode"]').click({ force: true });
    cy.get('.glass-enhanced').should('be.visible');
    cy.get('.glass-btn-primary').should('be.visible');
  });

  it('is responsive on mobile viewport', () => {
    // Test mobile responsiveness
    cy.viewport(375, 667); // iPhone SE dimensions
    
    cy.get('.glass-enhanced').should('be.visible');
    cy.get('[role="tab"]').should('be.visible');
    cy.get('#email').should('be.visible');
    cy.get('#password').should('be.visible');
    
    // Check that form elements are properly sized
    cy.get('.w-full').should('have.css', 'width').and('match', /^\d+px$/);
  });
});