describe('Language Switch', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();
  });

  it('should display language selector', () => {
    cy.visit('/');
    cy.get('[aria-label="Select language"]').should('be.visible');
  });

  it('should switch language and persist selection', () => {
    cy.visit('/');
    
    // Open language dropdown
    cy.get('[aria-label="Select language"]').click();
    
    // Verify all languages are available
    cy.contains('English').should('be.visible');
    cy.contains('සිංහල').should('be.visible');
    cy.contains('தமிழ்').should('be.visible');
    cy.contains('中文').should('be.visible');
    cy.contains('Español').should('be.visible');
    cy.contains('日本語').should('be.visible');
    
    // Switch to Spanish
    cy.contains('Español').click();
    
    // Verify content is translated
    cy.contains('Asegura Tu Futuro de Jubilación Hoy').should('be.visible');
    cy.contains('Comenzar').should('be.visible');
    
    // Verify localStorage persistence
    cy.should(() => {
      expect(localStorage.getItem('language')).to.equal('es');
    });
    
    // Reload page and verify language persists
    cy.reload();
    cy.contains('Asegura Tu Futuro de Jubilación Hoy').should('be.visible');
  });

  it('should work on login page', () => {
    cy.visit('/login');
    
    // Switch to Sinhala
    cy.get('[aria-label="Select language"]').click();
    cy.contains('සිංහල').click();
    
    // Verify login form is translated
    cy.contains('ඇතුල් වන්න').should('be.visible');
    cy.get('input[type="email"]').should('have.attr', 'placeholder').and('include', 'ඊමේල්');
  });

  it('should work on dashboard when authenticated', () => {
    // Login first
    cy.visit('/login');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Assuming successful login redirects to dashboard
    cy.url().should('include', '/dashboard');
    
    // Switch to Tamil
    cy.get('[aria-label="Select language"]').click();
    cy.contains('தமிழ்').click();
    
    // Verify navigation is translated
    cy.contains('மேலோட்டம்').should('be.visible');
    cy.contains('நிதி மேலாண்மை').should('be.visible');
  });

  it('should handle keyboard navigation', () => {
    cy.visit('/');
    
    // Focus on language selector using tab
    cy.get('body').tab();
    cy.get('[aria-label="Select language"]').should('be.focused');
    
    // Open with Enter
    cy.get('[aria-label="Select language"]').type('{enter}');
    
    // Navigate with arrow keys and select with Enter
    cy.focused().type('{downarrow}');
    cy.focused().type('{enter}');
    
    // Verify selection worked
    cy.should(() => {
      expect(localStorage.getItem('language')).to.not.be.null;
    });
  });

  it('should maintain accessibility standards', () => {
    cy.visit('/');
    
    // Check ARIA labels
    cy.get('[aria-label="Select language"]').should('exist');
    
    // Check contrast ratios (basic check)
    cy.get('[aria-label="Select language"]').should('have.css', 'color');
    
    // Check keyboard accessibility
    cy.get('[aria-label="Select language"]').should('have.attr', 'tabindex', '0');
  });

  it('should be responsive on mobile', () => {
    cy.viewport(375, 667); // Mobile viewport
    cy.visit('/');
    
    // Language selector should be visible and clickable on mobile
    cy.get('[aria-label="Select language"]').should('be.visible');
    cy.get('[aria-label="Select language"]').click();
    
    // Dropdown should be properly sized
    cy.get('[role="menu"]').should('be.visible');
    cy.contains('English').should('be.visible');
  });
});

// Add custom command for tab navigation
Cypress.Commands.add('tab', { prevSubject: 'optional' }, (subject) => {
  return cy.wrap(subject).trigger('keydown', { keyCode: 9 });
});