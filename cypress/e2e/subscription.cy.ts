describe('Subscription Management', () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: {
          id: 'test-user-id',
          email: 'test@example.com'
        }
      }));
    });
  });

  it('should display subscription tab in profile settings', () => {
    cy.visit('/dashboard/profile');
    
    // Check if subscription tab exists
    cy.get('[data-testid="tabs-list"]').should('contain', 'Subscription');
    
    // Click on subscription tab
    cy.get('[data-value="subscription"]').click();
    
    // Should display subscription content
    cy.get('[data-testid="subscription-tab"]').should('be.visible');
  });

  it('should display current plan information', () => {
    cy.visit('/dashboard/profile?tab=subscription');
    
    // Should show current plan card
    cy.get('[data-testid="current-plan-card"]').should('be.visible');
    
    // Should display plan badge
    cy.get('[data-testid="plan-badge"]').should('be.visible');
    
    // Should show plan features
    cy.get('[data-testid="plan-features"]').should('be.visible');
  });

  it('should display credits usage for free users', () => {
    // Mock free user data
    cy.intercept('GET', '**/subscription**', {
      statusCode: 200,
      body: { plan_type: 'free' }
    });

    cy.intercept('GET', '**/credits**', {
      statusCode: 200,
      body: { 
        available_credits: 100,
        used_credits: 25,
        reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });

    cy.visit('/dashboard/profile?tab=subscription');
    
    // Should show credits usage
    cy.get('[data-testid="credits-usage"]').should('be.visible');
    
    // Should display progress bar
    cy.get('[data-testid="credits-progress"]').should('be.visible');
    
    // Should show upgrade button
    cy.get('[data-testid="upgrade-button"]').should('contain', 'Upgrade to Pro');
  });

  it('should display unlimited access for pro users', () => {
    // Mock pro user data
    cy.intercept('GET', '**/subscription**', {
      statusCode: 200,
      body: { 
        plan_type: 'pro',
        payment_status: 'active',
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });

    cy.visit('/dashboard/profile?tab=subscription');
    
    // Should show pro badge
    cy.get('[data-testid="plan-badge"]').should('contain', 'Pro Plan');
    
    // Should show unlimited credits message
    cy.get('[data-testid="credits-status"]').should('contain', 'Unlimited');
    
    // Should show downgrade and cancel buttons
    cy.get('[data-testid="downgrade-button"]').should('be.visible');
    cy.get('[data-testid="cancel-button"]').should('be.visible');
  });

  it('should open upgrade modal for free users', () => {
    cy.intercept('GET', '**/subscription**', {
      statusCode: 200,
      body: { plan_type: 'free' }
    });

    cy.visit('/dashboard/profile?tab=subscription');
    
    // Click upgrade button
    cy.get('[data-testid="upgrade-button"]').click();
    
    // Should open upgrade modal
    cy.get('[data-testid="subscription-modal"]').should('be.visible');
    cy.get('[data-testid="modal-title"]').should('contain', 'Upgrade to Pro');
    
    // Should show pro features
    cy.get('[data-testid="modal-features"]').should('be.visible');
    
    // Should show pricing in LKR
    cy.get('[data-testid="upgrade-button"]').should('contain', 'Rs 6,000');
  });

  it('should handle payment flow for upgrades', () => {
    // Mock payment link creation
    cy.intercept('POST', '**/functions/v1/create-payment-link', {
      statusCode: 200,
      body: {
        success: true,
        payment_url: 'https://onepay.lk/pay/test-link',
        transaction_id: 'SUB_123456789'
      }
    });

    cy.visit('/dashboard/profile?tab=subscription');
    
    cy.get('[data-testid="upgrade-button"]').click();
    
    // Click upgrade in modal
    cy.get('[data-testid="modal-upgrade-button"]').click();
    
    // Should redirect to payment gateway (we'll mock this)
    cy.window().then((win) => {
      // In a real test, this would redirect to Onepay
      expect(win.location.href).to.include('onepay.lk');
    });
  });

  it('should open downgrade modal for pro users', () => {
    cy.intercept('GET', '**/subscription**', {
      statusCode: 200,
      body: { plan_type: 'pro' }
    });

    cy.visit('/dashboard/profile?tab=subscription');
    
    // Click downgrade button
    cy.get('[data-testid="downgrade-button"]').click();
    
    // Should open downgrade modal
    cy.get('[data-testid="subscription-modal"]').should('be.visible');
    cy.get('[data-testid="modal-title"]').should('contain', 'Confirm Downgrade');
    
    // Should show warning about losing features
    cy.get('[data-testid="modal-features"]').should('contain', 'Lose unlimited AI access');
  });

  it('should open cancellation modal for pro users', () => {
    cy.intercept('GET', '**/subscription**', {
      statusCode: 200,
      body: { plan_type: 'pro' }
    });

    cy.visit('/dashboard/profile?tab=subscription');
    
    // Click cancel button
    cy.get('[data-testid="cancel-button"]').click();
    
    // Should open cancellation modal
    cy.get('[data-testid="subscription-modal"]').should('be.visible');
    cy.get('[data-testid="modal-title"]').should('contain', 'Cancel Subscription');
    
    // Should show cancellation warning
    cy.get('[data-testid="modal-features"]').should('contain', 'Access until billing cycle ends');
  });

  it('should display monthly usage summary for free users', () => {
    cy.intercept('GET', '**/credits**', {
      statusCode: 200,
      body: { 
        available_credits: 100,
        used_credits: 45,
        reset_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
      }
    });

    cy.visit('/dashboard/profile?tab=subscription');
    
    // Should show usage summary
    cy.get('[data-testid="usage-summary"]').should('be.visible');
    
    // Should display used credits
    cy.get('[data-testid="credits-used"]').should('contain', '45');
    
    // Should display remaining credits
    cy.get('[data-testid="credits-remaining"]').should('contain', '55');
    
    // Should display total credits
    cy.get('[data-testid="total-credits"]').should('contain', '100');
  });

  it('should show low credits warning', () => {
    cy.intercept('GET', '**/credits**', {
      statusCode: 200,
      body: { 
        available_credits: 100,
        used_credits: 95,
        reset_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
      }
    });

    cy.visit('/dashboard/profile?tab=subscription');
    
    // Should show low credits warning
    cy.get('[data-testid="credits-warning"]').should('be.visible');
    cy.get('[data-testid="credits-warning"]').should('contain', 'Running low on credits');
  });

  it('should show no credits warning', () => {
    cy.intercept('GET', '**/credits**', {
      statusCode: 200,
      body: { 
        available_credits: 100,
        used_credits: 100,
        reset_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
      }
    });

    cy.visit('/dashboard/profile?tab=subscription');
    
    // Should show no credits warning
    cy.get('[data-testid="credits-warning"]').should('be.visible');
    cy.get('[data-testid="credits-warning"]').should('contain', 'No credits remaining');
  });

  it('should be responsive on mobile devices', () => {
    cy.viewport('iphone-x');
    cy.visit('/dashboard/profile?tab=subscription');
    
    // Should stack tabs vertically on mobile
    cy.get('[data-testid="tabs-list"]').should('be.visible');
    
    // Buttons should stack on mobile
    cy.get('[data-testid="action-buttons"]').should('be.visible');
    
    // Cards should be full width
    cy.get('[data-testid="current-plan-card"]').should('have.css', 'width');
  });

  it('should handle subscription errors gracefully', () => {
    // Mock API error
    cy.intercept('GET', '**/subscription**', {
      statusCode: 500,
      body: { error: 'Internal server error' }
    });

    cy.visit('/dashboard/profile?tab=subscription');
    
    // Should show loading state or error message
    cy.get('[data-testid="subscription-error"]').should('be.visible');
  });

  it('should refresh subscription data after changes', () => {
    let callCount = 0;
    
    cy.intercept('GET', '**/subscription**', (req) => {
      callCount++;
      req.reply({
        statusCode: 200,
        body: { 
          plan_type: callCount === 1 ? 'free' : 'pro',
          payment_status: 'active'
        }
      });
    });

    cy.visit('/dashboard/profile?tab=subscription');
    
    // Initial state should be free
    cy.get('[data-testid="plan-badge"]').should('contain', 'Free');
    
    // Simulate successful upgrade
    cy.window().then(() => {
      // Trigger refresh
      cy.get('[data-testid="refresh-button"]').click();
      
      // Should now show pro
      cy.get('[data-testid="plan-badge"]').should('contain', 'Pro');
    });
  });
});