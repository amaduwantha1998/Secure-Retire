describe('Pro Upgrade Live Transaction', () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'test-user-id',
          email: 'test@example.com'
        }
      }));
    });
    
    cy.visit('/dashboard/profile');
    cy.get('[data-testid="subscription-tab"]').click();
  });

  it('should display Rs. 20 pricing for Pro upgrade', () => {
    cy.contains('LKR 20.00').should('be.visible');
    cy.get('[aria-label="Upgrade to Pro for Rs. 20"]').should('be.visible');
  });

  it('should open confirmation modal when upgrade button is clicked', () => {
    cy.get('[aria-label="Upgrade to Pro for Rs. 20"]').click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.contains('Confirm Pro Upgrade').should('be.visible');
    cy.contains('LKR 20.00').should('be.visible');
  });

  it('should show transaction details in confirmation modal', () => {
    cy.get('[aria-label="Upgrade to Pro for Rs. 20"]').click();
    cy.contains('Transaction Details').should('be.visible');
    cy.contains('Plan: Pro').should('be.visible');
    cy.contains('Amount: LKR 20.00').should('be.visible');
    cy.contains('Monthly').should('be.visible');
  });

  it('should list Pro features in confirmation modal', () => {
    cy.get('[aria-label="Upgrade to Pro for Rs. 20"]').click();
    cy.contains('Unlimited AI features').should('be.visible');
    cy.contains('Priority support').should('be.visible');
    cy.contains('Advanced analytics').should('be.visible');
  });

  it('should have accessible buttons with proper ARIA labels', () => {
    cy.get('[aria-label="Upgrade to Pro for Rs. 20"]').should('have.attr', 'tabindex', '0');
    
    cy.get('[aria-label="Upgrade to Pro for Rs. 20"]').click();
    cy.get('[aria-label="Proceed to payment"]').should('be.visible');
    cy.get('[aria-label="Proceed to payment"]').should('have.attr', 'tabindex', '0');
  });

  it('should be responsive on mobile devices', () => {
    cy.viewport(320, 568); // iPhone SE
    cy.get('[aria-label="Upgrade to Pro for Rs. 20"]').should('be.visible');
    
    cy.get('[aria-label="Upgrade to Pro for Rs. 20"]').click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('[aria-label="Proceed to payment"]').should('be.visible');
  });

  it('should be responsive on tablet devices', () => {
    cy.viewport(768, 1024); // iPad
    cy.get('[aria-label="Upgrade to Pro for Rs. 20"]').should('be.visible');
    
    cy.get('[aria-label="Upgrade to Pro for Rs. 20"]').click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('[aria-label="Proceed to payment"]').should('be.visible');
  });

  it('should be responsive on desktop', () => {
    cy.viewport(1024, 768); // Desktop
    cy.get('[aria-label="Upgrade to Pro for Rs. 20"]').should('be.visible');
    
    cy.get('[aria-label="Upgrade to Pro for Rs. 20"]').click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('[aria-label="Proceed to payment"]').should('be.visible');
  });

  it('should close confirmation modal when cancel is clicked', () => {
    cy.get('[aria-label="Upgrade to Pro for Rs. 20"]').click();
    cy.get('[role="dialog"]').should('be.visible');
    
    cy.contains('Cancel').click();
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('should handle payment initiation with proper loading states', () => {
    // Mock the payment link creation
    cy.intercept('POST', '**/functions/v1/create-payment-link', {
      statusCode: 200,
      body: { payment_url: 'https://test-payment-url.com' }
    }).as('createPaymentLink');

    cy.get('[aria-label="Upgrade to Pro for Rs. 20"]').click();
    cy.get('[aria-label="Proceed to payment"]').click();

    // Should show loading state
    cy.get('[aria-label="Proceed to payment"]').should('contain', 'svg'); // Loading spinner

    cy.wait('@createPaymentLink');
  });

  it('should display error message if payment link creation fails', () => {
    // Mock failed payment link creation
    cy.intercept('POST', '**/functions/v1/create-payment-link', {
      statusCode: 500,
      body: { error: 'Payment gateway error' }
    }).as('createPaymentLinkError');

    cy.get('[aria-label="Upgrade to Pro for Rs. 20"]').click();
    cy.get('[aria-label="Proceed to payment"]').click();

    cy.wait('@createPaymentLinkError');
    cy.contains('Failed to create payment link').should('be.visible');
  });
});