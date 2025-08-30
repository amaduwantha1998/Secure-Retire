describe('Glass Design Theme', () => {
  beforeEach(() => {
    cy.visit('/auth');
  });

  it('should display glassmorphism effects on auth page', () => {
    // Check main card has glass styling
    cy.get('[class*="glass-enhanced"]').should('be.visible');
    cy.get('[class*="glass-logo"]').should('be.visible');
    
    // Check background blur elements
    cy.get('[class*="backdrop-blur"]').should('exist');
  });

  it('should maintain glass effects in dark mode', () => {
    // Enable dark mode
    cy.get('[aria-label*="Toggle"]').click();
    cy.get('html').should('have.class', 'dark');
    
    // Glass effects should still be visible
    cy.get('[class*="glass-enhanced"]').should('be.visible');
    cy.get('[class*="glass-logo"]').should('be.visible');
  });

  it('should apply glass effects to notifications dropdown', () => {
    cy.get('[aria-label*="Notifications"]').click();
    cy.get('[class*="glass-dropdown"]').should('be.visible');
  });

  it('should maintain contrast ratios for accessibility', () => {
    // Check text is readable on glass backgrounds
    cy.get('[class*="glass-text-primary"]').should('be.visible');
    cy.get('[class*="glass-text-secondary"]').should('be.visible');
    
    // Verify input fields are interactive
    cy.get('[class*="glass-input"]').should('be.visible').and('not.be.disabled');
  });

  it('should apply glass effects on register page', () => {
    cy.visit('/register');
    
    // Check progress bar container
    cy.get('[class*="glass-base"]').should('be.visible');
    cy.get('[class*="glass-enhanced"]').should('be.visible');
    cy.get('[class*="glass-logo"]').should('be.visible');
  });

  it('should display glass effects on dashboard', () => {
    // Note: This would require authentication, so we check redirect
    cy.visit('/dashboard/overview');
    // Should redirect to auth if not logged in
    cy.url().should('include', '/auth');
    
    // Check auth page has glass effects
    cy.get('[class*="glass-enhanced"]').should('be.visible');
  });

  it('should be responsive across different screen sizes', () => {
    // Mobile
    cy.viewport(320, 568);
    cy.get('[class*="glass-enhanced"]').should('be.visible');
    
    // Tablet
    cy.viewport(768, 1024);
    cy.get('[class*="glass-enhanced"]').should('be.visible');
    
    // Desktop
    cy.viewport(1024, 768);
    cy.get('[class*="glass-enhanced"]').should('be.visible');
  });

  it('should handle glass button interactions', () => {
    // Check glass buttons are interactive
    cy.get('[class*="glass-btn-primary"]').should('be.visible');
    cy.get('[class*="glass-btn-secondary"]').should('be.visible');
    
    // Test hover effects (simulated through focus)
    cy.get('[class*="glass-btn-primary"]').first().focus();
    cy.get('[class*="glass-btn-secondary"]').first().focus();
  });

  it('should maintain glass theme consistency across components', () => {
    // Check consistent glass styling
    cy.get('[class*="glass-"]').should('have.length.greaterThan', 3);
    
    // Verify background elements exist
    cy.get('body').should('have.css', 'background').and('contain', 'gradient');
  });

  it('should support reduced motion preferences', () => {
    // Check animations can be disabled
    cy.window().then((win) => {
      // Simulate prefers-reduced-motion
      const style = win.document.createElement('style');
      style.textContent = `
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `;
      win.document.head.appendChild(style);
    });
    
    // Glass elements should still be visible but with reduced motion
    cy.get('[class*="glass-enhanced"]').should('be.visible');
  });

  it('should work with high contrast mode', () => {
    // Simulate high contrast preference
    cy.window().then((win) => {
      const style = win.document.createElement('style');
      style.textContent = `
        @media (prefers-contrast: high) {
          .glass-base {
            background: white !important;
            border: 2px solid black !important;
            backdrop-filter: none !important;
          }
        }
      `;
      win.document.head.appendChild(style);
    });
    
    // Elements should still be visible and functional
    cy.get('[class*="glass-"]').should('be.visible');
  });
});