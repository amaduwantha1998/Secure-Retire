describe('Payment Link Integration', () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      }));
    });
    
    // Mock subscription data for free user
    cy.intercept('GET', '**/subscription**', {
      statusCode: 200,
      body: {
        plan_type: 'free',
        payment_status: 'none',
        end_date: null
      }
    }).as('getSubscription');

    // Mock credits data
    cy.intercept('GET', '**/credits**', {
      statusCode: 200,
      body: {
        available_credits: 100,
        used_credits: 25
      }
    }).as('getCredits');
  });

  it('displays upgrade button for free users', () => {
    cy.visit('/dashboard/profile');
    cy.contains('Subscription').click();
    
    cy.wait(['@getSubscription', '@getCredits']);
    
    // Should show upgrade button
    cy.get('[aria-label="Upgrade to Pro"]').should('be.visible');
    cy.contains('Upgrade to Pro').should('be.visible');
    cy.contains('LKR 6,000/mo').should('be.visible');
  });

  it('opens payment link in new tab when upgrade button is clicked', () => {
    cy.visit('/dashboard/profile');
    cy.contains('Subscription').click();
    
    cy.wait(['@getSubscription', '@getCredits']);
    
    // Mock window.open to prevent actual navigation
    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen');
    });

    // Click upgrade button
    cy.get('[aria-label="Upgrade to Pro"]').click();
    
    // Verify payment link was opened in new tab
    cy.get('@windowOpen').should('have.been.calledWith', 
      'https://link.onepay.lk/redirect/O1YX119095F6CEF6529CF/1e555c91a85f05c5bf845d803dedda19d880b14fbe471d3d60ff31f68fca7e6d',
      '_blank',
      'noopener,noreferrer'
    );
    
    // Should show success toast
    cy.contains('Payment link opened').should('be.visible');
  });

  it('does not show upgrade option for pro users', () => {
    // Mock pro user subscription
    cy.intercept('GET', '**/subscription**', {
      statusCode: 200,
      body: {
        plan_type: 'pro',
        payment_status: 'completed',
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    }).as('getProSubscription');

    cy.intercept('GET', '**/credits**', {
      statusCode: 200,
      body: {
        available_credits: 999999,
        used_credits: 0
      }
    }).as('getProCredits');

    cy.visit('/dashboard/profile');
    cy.contains('Subscription').click();
    
    cy.wait(['@getProSubscription', '@getProCredits']);
    
    // Should show Pro plan badge
    cy.contains('Pro Plan').should('be.visible');
    
    // Should show unlimited credits
    cy.contains('Unlimited Credits').should('be.visible');
    
    // Should not show upgrade button
    cy.get('[aria-label="Upgrade to Pro"]').should('not.exist');
    
    // Should show downgrade and cancel options
    cy.contains('Downgrade to Free').should('be.visible');
    cy.contains('Cancel Subscription').should('be.visible');
  });

  it('handles subscription update via webhook simulation', () => {
    // Start as free user
    cy.visit('/dashboard/profile');
    cy.contains('Subscription').click();
    
    cy.wait(['@getSubscription', '@getCredits']);
    
    // Simulate webhook updating subscription to pro
    cy.intercept('GET', '**/subscription**', {
      statusCode: 200,
      body: {
        plan_type: 'pro',
        payment_status: 'completed',
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    }).as('getUpdatedSubscription');

    cy.intercept('GET', '**/credits**', {
      statusCode: 200,
      body: {
        available_credits: 999999,
        used_credits: 0
      }
    }).as('getUpdatedCredits');

    // Trigger refresh (simulate real-time update)
    cy.reload();
    cy.contains('Subscription').click();
    
    cy.wait(['@getUpdatedSubscription', '@getUpdatedCredits']);
    
    // Should now show Pro plan
    cy.contains('Pro Plan').should('be.visible');
    cy.contains('Unlimited Credits').should('be.visible');
  });

  it('maintains accessibility standards', () => {
    cy.visit('/dashboard/profile');
    cy.contains('Subscription').click();
    
    cy.wait(['@getSubscription', '@getCredits']);
    
    // Check ARIA labels
    cy.get('[aria-label="Upgrade to Pro"]').should('be.visible');
    
    // Check keyboard navigation
    cy.get('[aria-label="Upgrade to Pro"]').focus();
    cy.focused().should('have.attr', 'tabindex', '0');
    
    // Check color contrast (Pro button should have good contrast)
    cy.get('[aria-label="Upgrade to Pro"]')
      .should('have.class', 'text-white')
      .should('have.class', 'bg-gradient-to-r');
  });

  it('works responsively on mobile devices', () => {
    cy.viewport(375, 667); // iPhone SE
    
    cy.visit('/dashboard/profile');
    cy.contains('Subscription').click();
    
    cy.wait(['@getSubscription', '@getCredits']);
    
    // Button should be full width on mobile
    cy.get('[aria-label="Upgrade to Pro"]')
      .should('be.visible')
      .should('have.class', 'flex-1');
    
    // Text should be readable
    cy.contains('Upgrade to Pro').should('be.visible');
    cy.contains('LKR 6,000/mo').should('be.visible');
  });

  it('handles API errors gracefully', () => {
    // Mock API error
    cy.intercept('GET', '**/subscription**', {
      statusCode: 500,
      body: { error: 'Server error' }
    }).as('getSubscriptionError');

    cy.visit('/dashboard/profile');
    cy.contains('Subscription').click();
    
    cy.wait('@getSubscriptionError');
    
    // Should show loading state initially, then handle error gracefully
    // The component should still render with fallback values
    cy.get('.animate-pulse').should('be.visible');
  });

  it('logs payment confirmation errors with proper error handling', () => {
    cy.visit('/dashboard/profile');
    cy.contains('Subscription').click();
    
    // Check that console errors are handled
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as('consoleError');
    });
    
    // Trigger error scenario (invalid payment link)
    cy.window().then((win) => {
      cy.stub(win, 'open').throws(new Error('Network error'));
    });

    cy.get('[aria-label="Upgrade to Pro"]').click();
    
    // Should handle error gracefully
    cy.get('@consoleError').should('have.been.called');
  });
});