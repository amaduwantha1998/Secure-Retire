describe('Subscription Tab Fix', () => {
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

  it('should display subscription tab without errors', () => {
    // Check that the subscription tab loads
    cy.contains('Current Plan').should('be.visible');
    cy.contains('Credits Usage').should('be.visible');
    
    // Check for upgrade button
    cy.get('button').contains('Upgrade to Pro').should('be.visible');
  });

  it('should show correct Pro plan pricing', () => {
    // Check that the Pro plan shows $1.00
    cy.contains('$1.00/mo').should('be.visible');
    
    // Check upgrade button text
    cy.get('button').contains('Upgrade to Pro').should('contain', '$1.00/mo');
  });

  it('should open confirmation modal when upgrade is clicked', () => {
    // Click upgrade button
    cy.get('button').contains('Upgrade to Pro').click();
    
    // Check modal content
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('[role="dialog"]').should('contain', 'Confirm Pro Upgrade');
    cy.get('[role="dialog"]').should('contain', '$1.00');
  });

  it('should handle Stripe integration with proper error handling', () => {
    // Mock successful Stripe response
    cy.intercept('POST', '**/functions/v1/create-payment-link', {
      statusCode: 200,
      body: { 
        success: true, 
        url: 'https://checkout.stripe.com/test-session',
        sessionId: 'cs_test_123'
      }
    }).as('createStripeSession');
    
    // Click upgrade and confirm
    cy.get('button').contains('Upgrade to Pro').click();
    cy.get('[role="dialog"]').within(() => {
      cy.get('button').contains('Proceed to Pay').click();
    });
    
    // Should call Stripe function
    cy.wait('@createStripeSession');
    
    // Should redirect (in a real scenario)
    cy.url().should('include', 'checkout.stripe.com');
  });

  it('should handle Stripe errors gracefully', () => {
    // Mock error response
    cy.intercept('POST', '**/functions/v1/create-payment-link', {
      statusCode: 500,
      body: { 
        success: false, 
        error: 'Payment system not configured. Please contact support.' 
      }
    }).as('createStripeSessionError');
    
    // Try to upgrade
    cy.get('button').contains('Upgrade to Pro').click();
    cy.get('[role="dialog"]').within(() => {
      cy.get('button').contains('Proceed to Pay').click();
    });
    
    // Should show error message
    cy.wait('@createStripeSessionError');
    cy.contains('Failed to initiate upgrade').should('be.visible');
  });

  it('should handle network errors', () => {
    // Mock network failure
    cy.intercept('POST', '**/functions/v1/create-payment-link', {
      forceNetworkError: true
    }).as('networkError');
    
    // Try to upgrade
    cy.get('button').contains('Upgrade to Pro').click();
    cy.get('[role="dialog"]').within(() => {
      cy.get('button').contains('Proceed to Pay').click();
    });
    
    // Should show error message
    cy.wait('@networkError');
    cy.contains('Failed to initiate upgrade').should('be.visible');
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
    cy.contains('Current Plan').should('be.visible');
    
    // Test tablet
    cy.viewport(768, 1024);
    cy.get('button').contains('Upgrade to Pro').should('be.visible');
    
    // Test desktop
    cy.viewport(1024, 768);
    cy.get('button').contains('Upgrade to Pro').should('be.visible');
  });

  it('should display loading states correctly', () => {
    // Mock slow response
    cy.intercept('POST', '**/functions/v1/create-payment-link', {
      statusCode: 200,
      body: { success: true, url: 'https://checkout.stripe.com/test' },
      delay: 2000
    }).as('slowStripeSession');
    
    // Click upgrade and confirm
    cy.get('button').contains('Upgrade to Pro').click();
    cy.get('[role="dialog"]').within(() => {
      cy.get('button').contains('Proceed to Pay').click();
      
      // Should show loading state
      cy.get('button').should('be.disabled');
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
    });
    
    cy.wait('@slowStripeSession');
  });

  it('should close modal when cancel is clicked', () => {
    // Open modal
    cy.get('button').contains('Upgrade to Pro').click();
    cy.get('[role="dialog"]').should('be.visible');
    
    // Close modal
    cy.get('button').contains('Cancel').click();
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('should handle subscription data loading states', () => {
    // Mock subscription data loading
    cy.intercept('GET', '**/rest/v1/subscriptions*', {
      statusCode: 200,
      body: [],
      delay: 1000
    }).as('loadSubscriptions');
    
    // Reload page
    cy.reload();
    
    // Should show loading skeleton
    cy.get('.animate-pulse').should('be.visible');
    
    cy.wait('@loadSubscriptions');
    
    // Should show content after loading
    cy.contains('Current Plan').should('be.visible');
  });
});