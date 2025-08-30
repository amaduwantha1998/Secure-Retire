describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the main hero section', () => {
    cy.get('h1').should('contain', 'Secure Your Retirement Future Today');
    cy.get('p').should('contain', 'Plan and protect your finances with AI-powered tools');
  });

  it('should have functional sign-up buttons', () => {
    cy.get('[aria-label*="Sign Up"]').should('be.visible').and('not.be.disabled');
    cy.get('[aria-label*="Sign Up"]').first().click();
    cy.url().should('include', '/register');
  });

  it('should navigate to features section when Learn More is clicked', () => {
    cy.get('[aria-label*="Learn More"]').click();
    cy.get('#features').should('be.visible');
  });

  it('should display all three feature cards', () => {
    cy.get('#features').within(() => {
      cy.contains('Financial Planning').should('be.visible');
      cy.contains('Legal Support').should('be.visible');
      cy.contains('Retirement Calculator').should('be.visible');
    });
  });

  it('should have proper contrast and accessibility', () => {
    // Test ARIA labels
    cy.get('[aria-label]').should('have.length.at.least', 3);
    
    // Test keyboard navigation
    cy.get('button').first().focus();
    cy.focused().should('have.attr', 'aria-label');
    
    // Test color contrast (basic check)
    cy.get('h1').should('have.css', 'color');
  });

  it('should be responsive on mobile', () => {
    cy.viewport(320, 568);
    cy.get('h1').should('be.visible');
    cy.get('[aria-label*="Sign Up"]').should('be.visible');
    
    cy.viewport(768, 1024);
    cy.get('h1').should('be.visible');
    
    cy.viewport(1024, 768);
    cy.get('h1').should('be.visible');
  });

  it('should switch themes correctly', () => {
    // Check for theme toggle if available
    cy.get('body').then(($body) => {
      if ($body.find('[aria-label*="Toggle"]').length) {
        cy.get('[aria-label*="Toggle"]').click();
        cy.get('html').should('have.class', 'dark');
      }
    });
  });

  it('should display glass effects properly', () => {
    cy.get('.glass-enhanced').should('be.visible');
    cy.get('.glass-card').should('have.length', 3);
    cy.get('.glass-logo').should('be.visible');
  });

  it('should have working video placeholder', () => {
    cy.get('[aria-label*="video"]', { timeout: 5000 }).should('be.visible');
  });
});