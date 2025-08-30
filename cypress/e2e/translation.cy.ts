describe('Real-Time Translation', () => {
  beforeEach(() => {
    // Clear localStorage and session storage
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  });

  it('should display content in English by default', () => {
    cy.visit('/');
    cy.contains('Secure Your Retirement Future Today').should('be.visible');
    cy.contains('Get Started').should('be.visible');
  });

  it('should translate login page in real-time', () => {
    cy.visit('/login');
    
    // Verify initial English content
    cy.contains('Welcome').should('be.visible');
    cy.contains('Sign in to your account').should('be.visible');
    
    // Change language to Spanish
    cy.get('[aria-label="Select language"]').click();
    cy.contains('Español').click();
    
    // Wait for translations to load
    cy.get('[aria-label="Select language"]', { timeout: 10000 }).should('not.have.attr', 'disabled');
    
    // Verify Spanish translations appear
    cy.contains('Bienvenido', { timeout: 10000 }).should('be.visible');
    cy.get('input[type="email"]').should('have.attr', 'placeholder').and('match', /correo|email/i);
  });

  it('should translate home page content dynamically', () => {
    cy.visit('/');
    
    // Change to Chinese
    cy.get('[aria-label="Select language"]').click();
    cy.contains('中文').click();
    
    // Wait for translation to complete
    cy.get('[aria-label="Select language"]', { timeout: 10000 }).should('not.have.attr', 'disabled');
    
    // Check for Chinese translations (may take time to load)
    cy.contains('确保您的退休未来', { timeout: 15000 }).should('be.visible');
  });

  it('should persist language selection across page reloads', () => {
    cy.visit('/');
    
    // Change language to Japanese
    cy.get('[aria-label="Select language"]').click();
    cy.contains('日本語').click();
    
    // Wait for language change
    cy.wait(2000);
    
    // Reload page
    cy.reload();
    
    // Verify language is still Japanese
    cy.should(() => {
      expect(localStorage.getItem('language')).to.equal('ja');
    });
  });

  it('should handle translation loading states', () => {
    cy.visit('/login');
    
    // Change language
    cy.get('[aria-label="Select language"]').click();
    cy.contains('සිංහල').click();
    
    // Check for loading spinner during language change
    cy.get('[aria-label="Select language"] .animate-spin').should('be.visible');
    
    // Wait for loading to complete
    cy.get('[aria-label="Select language"]', { timeout: 10000 }).should('not.have.attr', 'disabled');
  });

  it('should work with keyboard navigation', () => {
    cy.visit('/');
    
    // Focus language selector with tab
    cy.get('body').tab();
    cy.get('[aria-label="Select language"]').should('be.focused');
    
    // Open dropdown with Enter
    cy.get('[aria-label="Select language"]').type('{enter}');
    
    // Navigate with arrow keys
    cy.focused().type('{downarrow}');
    cy.focused().type('{enter}');
    
    // Verify language changed
    cy.wait(2000);
    cy.should(() => {
      expect(localStorage.getItem('language')).to.not.equal('en');
    });
  });

  it('should handle translation errors gracefully', () => {
    // Mock translation API to fail
    cy.intercept('POST', '**/functions/v1/translate-text', {
      statusCode: 500,
      body: { error: 'Translation service unavailable' }
    }).as('translationError');
    
    cy.visit('/login');
    
    // Change language
    cy.get('[aria-label="Select language"]').click();
    cy.contains('Español').click();
    
    // Wait for error handling
    cy.wait('@translationError');
    
    // Should fall back to original text
    cy.contains('Welcome').should('be.visible');
  });

  it('should work on mobile devices', () => {
    cy.viewport(375, 667); // Mobile viewport
    cy.visit('/');
    
    // Language selector should be visible and functional
    cy.get('[aria-label="Select language"]').should('be.visible');
    cy.get('[aria-label="Select language"]').click();
    
    // Dropdown should be properly sized
    cy.get('[role="menu"]').should('be.visible');
    cy.get('[role="menu"]').should('have.css', 'width');
    
    // Select language
    cy.contains('Español').click();
    
    // Verify mobile layout still works
    cy.get('[aria-label="Select language"]', { timeout: 10000 }).should('not.have.attr', 'disabled');
  });

  it('should translate dashboard navigation', () => {
    // First login (assuming test user exists)
    cy.visit('/login');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Should be on dashboard
    cy.url().should('include', '/dashboard');
    
    // Change language to Tamil
    cy.get('[aria-label="Select language"]').click();
    cy.contains('தமிழ்').click();
    
    // Wait for translations
    cy.get('[aria-label="Select language"]', { timeout: 10000 }).should('not.have.attr', 'disabled');
    
    // Check for Tamil navigation translations
    cy.contains('மேலோட்டம்', { timeout: 15000 }).should('be.visible');
  });

  it('should maintain accessibility during translation', () => {
    cy.visit('/');
    
    // Check ARIA attributes before translation
    cy.get('[aria-label="Select language"]').should('have.attr', 'aria-label');
    
    // Change language
    cy.get('[aria-label="Select language"]').click();
    cy.contains('Español').click();
    
    // Wait for translation
    cy.wait(3000);
    
    // Check ARIA attributes are maintained
    cy.get('[aria-label]').should('have.length.greaterThan', 0);
    
    // Check color contrast (basic test)
    cy.get('[aria-label="Select language"]').should('be.visible');
  });
});

// Add custom command for tab navigation
declare global {
  namespace Cypress {
    interface Chainable {
      tab(): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add('tab', { prevSubject: 'optional' }, (subject) => {
  return cy.wrap(subject).trigger('keydown', { keyCode: 9, which: 9 });
});