describe('Auth UI Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the login page with correct layout', () => {
    cy.visit('/login');
    
    // Check split-screen layout
    cy.get('[data-testid="auth-form-container"]').should('be.visible');
    cy.get('[data-testid="auth-marketing-container"]').should('be.visible');
    
    // Check logo and heading
    cy.get('h1').should('contain', 'Welcome Back');
    cy.get('p').should('contain', 'Sign in to manage your retirement planning');
    
    // Check form fields
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('input[type="checkbox"]').should('be.visible');
    cy.get('button').contains('Sign In').should('be.visible');
    
    // Check navigation links
    cy.get('a').contains('Create Account').should('have.attr', 'href').and('include', '/signup');
    cy.get('button').contains('Forgot Password?').should('be.visible');
  });

  it('should display the signup page with correct layout', () => {
    cy.visit('/signup');
    
    // Check form fields for signup
    cy.get('input[placeholder="Enter your full name"]').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[placeholder="+1 000 0000 0000"]').should('be.visible');
    cy.get('input[type="password"]').should('have.length', 2); // Password and confirm password
    cy.get('button').contains('Register').should('be.visible');
    
    // Check navigation links
    cy.get('a').contains('Sign in').should('have.attr', 'href').and('include', '/login');
  });

  it('should display marketing content on desktop', () => {
    cy.viewport(1200, 800);
    cy.visit('/login');
    
    // Marketing content should be visible on larger screens
    cy.contains('Your Trusted Partner in').should('be.visible');
    cy.contains('Retirement Planning').should('be.visible');
    cy.contains('Bank-Level Security').should('be.visible');
    cy.contains('SSL Encrypted').should('be.visible');
    cy.contains('Data Protection').should('be.visible');
    cy.contains('1-800-SECURE').should('be.visible');
  });

  it('should hide marketing content on mobile', () => {
    cy.viewport(375, 667);
    cy.visit('/login');
    
    // Marketing content should be hidden on mobile
    cy.contains('Your Trusted Partner in').should('not.be.visible');
  });

  it('should toggle password visibility', () => {
    cy.visit('/login');
    
    cy.get('input[type="password"]').should('be.visible');
    cy.get('[aria-label="Show password"]').click();
    cy.get('input[type="text"]').should('be.visible');
    cy.get('[aria-label="Hide password"]').click();
    cy.get('input[type="password"]').should('be.visible');
  });

  it('should handle form validation', () => {
    cy.visit('/login');
    
    // Try to submit empty form
    cy.get('button').contains('Sign In').click();
    
    // Should show validation errors
    cy.get('[role="alert"]').should('be.visible');
  });

  it('should navigate between login and signup', () => {
    cy.visit('/login');
    cy.get('a').contains('Create Account').click();
    cy.url().should('include', '/signup');
    
    cy.get('a').contains('Sign in').click();
    cy.url().should('include', '/login');
  });

  it('should support theme switching', () => {
    cy.visit('/login');
    
    // Click theme toggle
    cy.get('[data-testid="theme-toggle"]').click();
    
    // Check if dark mode classes are applied
    cy.get('html').should('have.class', 'dark');
    
    // Toggle back to light mode
    cy.get('[data-testid="theme-toggle"]').click();
    cy.get('html').should('not.have.class', 'dark');
  });

  it('should have accessible form elements', () => {
    cy.visit('/login');
    
    // Check ARIA labels and accessibility
    cy.get('input[type="email"]').should('have.attr', 'aria-describedby');
    cy.get('input[type="password"]').should('have.attr', 'aria-describedby');
    cy.get('button').contains('Sign In').should('have.attr', 'aria-label');
    
    // Check keyboard navigation
    cy.get('input[type="email"]').focus().should('be.focused');
    cy.get('input[type="email"]').tab().should('not.be.focused');
  });

  it('should handle back navigation to home', () => {
    cy.visit('/login');
    
    cy.get('button').contains('Home').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('should display proper glass morphism effects', () => {
    cy.visit('/login');
    
    // Check for glass effect classes
    cy.get('.glass-input').should('exist');
    cy.get('.glass-btn-secondary').should('exist');
    cy.get('.glass-base').should('exist');
  });
});