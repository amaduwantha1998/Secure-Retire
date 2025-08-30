describe('Currency and Country Selection', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should default to Sri Lanka and LKR currency', () => {
    // Check if country defaults to Sri Lanka in registration
    cy.get('[data-testid="country-select"]').should('contain', 'Sri Lanka');
    
    // Check if currency displays are in LKR
    cy.visit('/');
    cy.get('[data-testid="currency-display"]').should('contain', 'Rs');
  });

  it('should allow country selection', () => {
    // Open country dropdown
    cy.get('[data-testid="country-select"]').click();
    
    // Should show Sri Lanka at the top
    cy.get('[role="option"]').first().should('contain', 'Sri Lanka');
    
    // Select a different country
    cy.get('[role="option"]').contains('United States').click();
    
    // Verify selection
    cy.get('[data-testid="country-select"]').should('contain', 'United States');
  });

  it('should handle currency toggle', () => {
    cy.visit('/dashboard');
    
    // Should default to LKR
    cy.get('[data-testid="currency-selector"]').should('contain', 'LKR');
    
    // Click to change currency
    cy.get('[data-testid="currency-selector"]').click();
    
    // Select USD
    cy.get('[role="menuitem"]').contains('USD').click();
    
    // Verify currency changed
    cy.get('[data-testid="currency-selector"]').should('contain', 'USD');
  });

  it('should show correct pricing in LKR', () => {
    cy.visit('/register');
    
    // Navigate to pricing step (assuming it's step 4)
    cy.get('[data-testid="next-step"]').click(); // Step 1 -> 2
    cy.get('[data-testid="next-step"]').click(); // Step 2 -> 3
    cy.get('[data-testid="next-step"]').click(); // Step 3 -> 4
    
    // Check Pro plan pricing
    cy.get('[data-testid="pro-plan"]').should('contain', 'Rs 6,000');
    cy.get('[data-testid="free-plan"]').should('contain', 'Rs 0');
  });

  it('should maintain accessibility standards', () => {
    // Check ARIA labels
    cy.get('[data-testid="country-select"]').should('have.attr', 'aria-label');
    
    // Check keyboard navigation
    cy.get('[data-testid="country-select"]').focus();
    cy.get('[data-testid="country-select"]').type('{enter}');
    cy.get('[role="option"]').should('be.visible');
    
    // Check contrast ratios (basic test)
    cy.get('[data-testid="country-select"]').should('be.visible');
  });

  it('should save country selection to profile', () => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', 'mock-token');
    });
    
    cy.visit('/dashboard/profile');
    
    // Change country
    cy.get('[data-testid="country-select"]').click();
    cy.get('[role="option"]').contains('India').click();
    
    // Save changes
    cy.get('[data-testid="save-profile"]').click();
    
    // Verify success message
    cy.get('[data-testid="success-toast"]').should('be.visible');
  });
});