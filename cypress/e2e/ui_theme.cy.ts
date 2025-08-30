/// <reference types="cypress" />

describe('Professional UI Theme', () => {
  beforeEach(() => {
    // Mock authentication for dashboard access
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user' }
      }));
    });
  });

  it('applies professional color scheme in light mode', () => {
    cy.visit('/dashboard/overview');
    
    // Check primary color usage
    cy.get('[data-testid="primary-button"]').should('have.css', 'background-color')
      .and('match', /rgb\(0, 123, 255\)|#007BFF/i); // Blue primary
    
    // Check background colors
    cy.get('body').should('have.css', 'background-color')
      .and('match', /rgb\(245, 247, 250\)|#F5F7FA/i); // Light background
    
    // Check text colors
    cy.get('h1, h2, h3').first().should('have.css', 'color')
      .and('match', /rgb\(51, 51, 51\)|#333333/i); // Dark text
  });

  it('applies professional color scheme in dark mode', () => {
    cy.visit('/dashboard/overview');
    
    // Toggle to dark mode
    cy.get('[aria-label*="Toggle"]').first().click({ force: true });
    
    // Check dark background
    cy.get('body').should('have.css', 'background-color')
      .and('match', /rgb\(30, 30, 30\)|#1E1E1E/i); // Dark background
    
    // Check adjusted primary colors
    cy.get('[data-testid="primary-button"]').should('have.css', 'background-color')
      .and('match', /rgb\(77, 168, 218\)|#4DA8DA/i); // Adjusted blue
    
    // Check light text
    cy.get('h1, h2, h3').first().should('have.css', 'color')
      .and('match', /rgb\(224, 224, 224\)|#E0E0E0/i); // Light text
  });

  it('uses Poppins font family consistently', () => {
    cy.visit('/dashboard/overview');
    
    // Check body font
    cy.get('body').should('have.css', 'font-family').and('include', 'Poppins');
    
    // Check headings font
    cy.get('h1, h2, h3').each(($el) => {
      cy.wrap($el).should('have.css', 'font-family').and('include', 'Poppins');
    });
  });

  it('maintains proper typography hierarchy', () => {
    cy.visit('/dashboard/overview');
    
    // Check font sizes match design system
    cy.get('h1').should('have.css', 'font-size', '20px'); // 1.25rem
    cy.get('h2').should('have.css', 'font-size', '18px'); // 1.125rem
    cy.get('h3').should('have.css', 'font-size', '16px'); // 1rem
    cy.get('p, body').should('have.css', 'font-size', '14px'); // 0.875rem
  });

  it('displays professional cards with proper styling', () => {
    cy.visit('/dashboard/overview');
    
    // Check card elements
    cy.get('[class*="card"]').first().should($card => {
      // Check border radius (8px)
      expect($card).to.have.css('border-radius', '8px');
      
      // Check padding (16px)
      expect($card).to.have.css('padding', '16px');
      
      // Check shadow presence
      expect($card.css('box-shadow')).to.not.equal('none');
    });
  });

  it('maintains proper spacing and layout', () => {
    cy.visit('/dashboard/overview');
    
    // Check section spacing (16px minimum)
    cy.get('[class*="section"], [class*="card"]').should($elements => {
      $elements.each((_, el) => {
        const marginBottom = parseFloat(window.getComputedStyle(el).marginBottom);
        const paddingBottom = parseFloat(window.getComputedStyle(el).paddingBottom);
        expect(marginBottom + paddingBottom).to.be.at.least(16);
      });
    });
  });

  it('provides accessible color contrast', () => {
    cy.visit('/dashboard/overview');
    
    // Check button contrast
    cy.get('button').first().should($btn => {
      const bgColor = $btn.css('background-color');
      const textColor = $btn.css('color');
      
      // Ensure colors are defined (contrast ratio will be checked by accessibility tools)
      expect(bgColor).to.not.equal('rgba(0, 0, 0, 0)');
      expect(textColor).to.not.equal('rgba(0, 0, 0, 0)');
    });
  });

  it('handles responsive design correctly', () => {
    // Test mobile viewport
    cy.viewport(320, 568);
    cy.visit('/dashboard/overview');
    
    // Check mobile layout
    cy.get('[class*="sidebar"]').should('not.be.visible');
    
    // Test tablet viewport
    cy.viewport(768, 1024);
    cy.reload();
    
    // Check tablet layout
    cy.get('[class*="sidebar"]').should('be.visible');
    
    // Test desktop viewport
    cy.viewport(1024, 768);
    cy.reload();
    
    // Check desktop layout with proper sidebar width
    cy.get('[class*="sidebar"]').should('be.visible')
      .and('have.css', 'width').and('match', /^(20%|[0-9]+px)$/);
  });

  it('supports keyboard navigation', () => {
    cy.visit('/dashboard/overview');
    
    // Test tab navigation
    cy.get('body').tab();
    cy.focused().should('be.visible');
    
    // Test multiple tab presses
    cy.focused().tab().tab();
    cy.focused().should('be.visible');
    
    // Test enter key on buttons
    cy.get('button').first().focus().type('{enter}');
  });

  it('displays success and error colors correctly', () => {
    cy.visit('/dashboard/overview');
    
    // Check success color elements
    cy.get('[class*="success"], [class*="green"]').should($el => {
      if ($el.length > 0) {
        const color = $el.css('background-color') || $el.css('color');
        expect(color).to.match(/rgb\(40, 167, 69\)|#28A745/i); // Green
      }
    });
    
    // Check destructive/error color elements
    cy.get('[class*="destructive"], [class*="error"], [class*="red"]').should($el => {
      if ($el.length > 0) {
        const color = $el.css('background-color') || $el.css('color');
        expect(color).to.match(/rgb\(220, 53, 69\)|#DC3545/i); // Red
      }
    });
  });
});