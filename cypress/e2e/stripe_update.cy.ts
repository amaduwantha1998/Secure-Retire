describe('Stripe Integration', () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });
    
    // Visit profile page
    cy.visit('/dashboard/profile?tab=subscription');
  });

  it('should display $1 Pro plan pricing', () => {
    // Check that the Pro plan shows $1.00
    cy.contains('$1.00/mo').should('be.visible');
    
    // Check upgrade button
    cy.get('button').contains('Upgrade to Pro').should('be.visible');
    cy.get('button').contains('Upgrade to Pro').should('contain', '$1.00/mo');
  });

  it('should open confirmation modal with correct pricing', () => {
    // Click upgrade button
    cy.get('button').contains('Upgrade to Pro').click();
    
    // Check modal content
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('[role="dialog"]').should('contain', '$1.00');
    cy.get('[role="dialog"]').should('contain', '/month');
    cy.get('[role="dialog"]').should('contain', 'Monthly subscription to upgrade to Pro');
  });

  it('should have proper accessibility attributes', () => {
    // Check ARIA labels
    cy.get('button').contains('Upgrade to Pro')
      .should('have.attr', 'aria-label')
      .and('include', 'Upgrade to Pro');
    
    // Check tab index
    cy.get('button').contains('Upgrade to Pro')
      .should('have.attr', 'tabindex', '0');
  });

  it('should be responsive on different screen sizes', () => {
    // Test mobile
    cy.viewport(320, 568);
    cy.get('button').contains('Upgrade to Pro').should('be.visible');
    
    // Test tablet
    cy.viewport(768, 1024);
    cy.get('button').contains('Upgrade to Pro').should('be.visible');
    
    // Test desktop
    cy.viewport(1024, 768);
    cy.get('button').contains('Upgrade to Pro').should('be.visible');
  });

  it('should close modal when cancel is clicked', () => {
    // Open modal
    cy.get('button').contains('Upgrade to Pro').click();
    cy.get('[role="dialog"]').should('be.visible');
    
    // Close modal
    cy.get('button').contains('Cancel').click();
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('should handle Stripe integration', () => {
    // Mock Supabase function response
    cy.intercept('POST', '**/functions/v1/create-checkout-session', {
      statusCode: 200,
      body: { url: 'https://checkout.stripe.com/test-session' }
    }).as('createCheckout');
    
    // Click upgrade and confirm
    cy.get('button').contains('Upgrade to Pro').click();
    cy.get('[role="dialog"]').within(() => {
      cy.get('button').contains('Proceed to Pay').click();
    });
    
    // Should call Stripe function
    cy.wait('@createCheckout');
  });

  it('should handle error states gracefully', () => {
    // Mock error response
    cy.intercept('POST', '**/functions/v1/create-checkout-session', {
      statusCode: 500,
      body: { error: 'Failed to create checkout session' }
    }).as('createCheckoutError');
    
    // Try to upgrade
    cy.get('button').contains('Upgrade to Pro').click();
    cy.get('[role="dialog"]').within(() => {
      cy.get('button').contains('Proceed to Pay').click();
    });
    
    // Should show error message
    cy.wait('@createCheckoutError');
    cy.contains('Failed to create checkout session').should('be.visible');
  });
});