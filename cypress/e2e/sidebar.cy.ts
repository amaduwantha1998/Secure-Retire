describe('Dashboard Sidebar', () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('auth-storage', JSON.stringify({
        state: { user: { id: '1', email: 'test@example.com' } },
        version: 0
      }));
    });
    cy.visit('/dashboard');
    cy.wait(1000); // Wait for component to load
  });

  it('should display the sidebar with logo and navigation items', () => {
    cy.get('[role="navigation"][aria-label="Dashboard navigation"]').should('be.visible');
    cy.get('.glass-logo').should('be.visible');
    
    // Check navigation items
    const navItems = [
      'Overview',
      'Financial Management',
      'Documents',
      'Retirement Calculator',
      'Investment Settings',
      'Beneficiaries',
      'Consultations',
      'Profile Settings',
      'Help Center'
    ];
    
    navItems.forEach((item) => {
      cy.contains(item).should('be.visible');
    });
  });

  it('should collapse and expand the sidebar', () => {
    // Check if sidebar is expanded by default on desktop
    cy.viewport(1024, 768);
    cy.get('[role="navigation"]').should('have.class', 'transition-all');
    
    // Find and click the sidebar trigger
    cy.get('[data-sidebar="trigger"]').first().click();
    
    // Verify collapsed state - icons should still be visible but text may be hidden
    cy.get('[role="navigation"]').should('exist');
    cy.get('.glass-logo').should('be.visible');
    
    // Click trigger again to expand
    cy.get('[data-sidebar="trigger"]').first().click();
    
    // Verify expanded state - text should be visible again
    cy.contains('Overview').should('be.visible');
  });

  it('should navigate to different routes when clicking navigation items', () => {
    // Test navigation to different routes
    cy.contains('Financial Management').click();
    cy.url().should('include', '/dashboard/financial');
    cy.go('back');
    
    cy.contains('Beneficiaries').click();
    cy.url().should('include', '/dashboard/beneficiaries');
    cy.go('back');
    
    cy.contains('Profile Settings').click();
    cy.url().should('include', '/dashboard/profile');
  });

  it('should highlight active navigation item', () => {
    // Navigate to a specific route
    cy.contains('Investment Settings').click();
    cy.url().should('include', '/dashboard/investments');
    
    // Check if the active item has the correct styling
    cy.contains('Investment Settings')
      .parent()
      .should('have.class', 'glass-interactive')
      .and('have.class', 'bg-primary/20')
      .and('have.class', 'text-primary');
  });

  it('should work properly on mobile devices', () => {
    cy.viewport(375, 667); // Mobile viewport
    
    // Sidebar should be visible
    cy.get('[role="navigation"]').should('be.visible');
    
    // Should be able to navigate
    cy.contains('Overview').click();
    cy.url().should('include', '/dashboard');
  });

  it('should maintain theme consistency', () => {
    // Check glass morphism classes
    cy.get('[role="navigation"]').should('have.class', 'glass-sidebar');
    cy.get('[role="navigation"]').should('have.class', 'backdrop-blur-xl');
    
    // Check logo glass effect
    cy.get('.glass-logo').should('exist');
  });

  it('should be keyboard accessible', () => {
    // Test keyboard navigation
    cy.get('body').type('{shift}{meta}b'); // Common sidebar toggle shortcut
    
    // Navigate using tab
    cy.get('body').tab();
    cy.focused().should('contain', 'Overview');
    
    // Navigate using arrow keys
    cy.focused().type('{downarrow}');
    cy.focused().should('contain', 'Financial Management');
  });

  it('should show tooltips when collapsed', () => {
    // Collapse sidebar first
    cy.get('[data-sidebar="trigger"]').first().click();
    
    // Hover over an icon to show tooltip
    cy.get('[aria-label="Overview"]').trigger('mouseover');
    
    // Check if tooltip appears (this might need adjustment based on tooltip implementation)
    cy.get('[role="tooltip"]').should('be.visible');
  });

  it('should handle window resize properly', () => {
    // Start with desktop
    cy.viewport(1024, 768);
    cy.contains('Overview').should('be.visible');
    
    // Resize to mobile
    cy.viewport(375, 667);
    cy.get('[role="navigation"]').should('be.visible');
    
    // Resize back to desktop
    cy.viewport(1024, 768);
    cy.contains('Overview').should('be.visible');
  });
});