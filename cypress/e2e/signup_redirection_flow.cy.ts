import { describe, it, expect, beforeEach } from 'cypress'

describe('Sign-Up Redirection Flow - Bug Fix Validation', () => {
  beforeEach(() => {
    cy.visit('/signup')
  })

  it('should not redirect to dashboard during signup flow', () => {
    // Fill signup form
    cy.get('#fullName').type('Test User Flow')
    cy.get('#email').type(`testflow${Date.now()}@example.com`)
    cy.get('#phone').type('+1234567890')
    cy.get('#password').type('TestPassword123!')
    cy.get('#confirmPassword').type('TestPassword123!')
    
    // Submit signup
    cy.get('button[aria-label="Create account"]').click()
    
    // Ensure we never hit dashboard during the flow
    cy.url({ timeout: 8000 }).should('include', '/register')
    cy.url().should('not.include', '/dashboard')
    
    // Verify registration form is displayed
    cy.get('h1').should('contain', 'Complete Your Profile')
    
    // Verify we start at step 1
    cy.get('[data-testid="current-step"]').should('contain', 'Step 1')
  })

  it('should maintain registration state and redirect only after completion', () => {
    // Mock authenticated state
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        currentSession: {
          access_token: 'mock-token',
          user: { id: 'test-user-id', email: 'test@example.com' }
        }
      }))
    })
    
    cy.visit('/register')
    
    // Complete minimal registration
    cy.get('input[placeholder*="Full name"]').type('John Doe')
    cy.get('input[type="date"]').type('1985-05-15')
    cy.get('input[placeholder*="Street address"]').type('123 Main St')
    cy.get('input[placeholder*="City"]').type('Anytown')
    cy.get('select').first().select('CA')
    cy.get('input[placeholder*="ZIP"]').type('12345')
    cy.get('input[placeholder*="phone"]').type('+1234567890')
    
    // Navigate through steps without redirection
    cy.get('button').contains('Next').click()
    cy.url().should('include', '/register')
    
    cy.get('button').contains('Next').click()
    cy.url().should('include', '/register')
    
    cy.get('button').contains('Next').click()
    cy.url().should('include', '/register')
    
    cy.get('button').contains('Next').click()
    cy.url().should('include', '/register')
    
    // Only redirect after final completion
    cy.get('button').contains('Complete Registration').click()
    
    // Should redirect to dashboard only now
    cy.url({ timeout: 12000 }).should('include', '/dashboard')
  })

  it('should clear previous user registration data on new signup', () => {
    // Simulate existing registration data in localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('registration-storage', JSON.stringify({
        state: {
          data: {
            isCompleted: true,
            currentStep: 5,
            personalInfo: { fullName: 'Previous User' }
          }
        }
      }))
    })
    
    // Fill and submit new signup
    cy.get('#fullName').type('New User')
    cy.get('#email').type(`newuser${Date.now()}@example.com`)
    cy.get('#password').type('TestPassword123!')
    cy.get('#confirmPassword').type('TestPassword123!')
    
    cy.get('button[aria-label="Create account"]').click()
    
    // Should go to register, not dashboard
    cy.url({ timeout: 8000 }).should('include', '/register')
    cy.url().should('not.include', '/dashboard')
    
    // Verify registration store was reset
    cy.window().then((win) => {
      const registrationData = JSON.parse(win.localStorage.getItem('registration-storage') || '{}')
      expect(registrationData.state?.data?.isCompleted).to.be.false
      expect(registrationData.state?.data?.currentStep).to.equal(1)
    })
  })

  it('should prevent back navigation loops after successful signup', () => {
    // Fill and submit signup
    cy.get('#fullName').type('Test No Loop')
    cy.get('#email').type(`noloop${Date.now()}@example.com`)
    cy.get('#phone').type('+1234567890')
    cy.get('#password').type('TestPassword123!')
    cy.get('#confirmPassword').type('TestPassword123!')
    
    cy.get('button[aria-label="Create account"]').click()
    
    // Wait for redirect to registration
    cy.url({ timeout: 8000 }).should('include', '/register')
    
    // Try to go back - should not be able to navigate back to signup
    cy.go('back')
    cy.url().should('include', '/register')
  })

  it('should show loading states during transitions', () => {
    // Intercept and delay signup request to see loading states
    cy.intercept('POST', '**/auth/v1/signup', {
      delay: 1000,
      statusCode: 200,
      body: { user: { id: '123', email: 'test@example.com' }, session: { access_token: 'token' } }
    }).as('signupRequest')
    
    cy.get('#fullName').type('Test Loading')
    cy.get('#email').type('testloading@example.com')
    cy.get('#password').type('TestPassword123!')
    cy.get('#confirmPassword').type('TestPassword123!')
    
    cy.get('button[aria-label="Create account"]').click()
    
    // Should show loading spinner
    cy.get('.animate-spin').should('be.visible')
    cy.get('button[aria-label="Create account"]').should('be.disabled')
    
    // Wait for completion
    cy.wait('@signupRequest')
    cy.url({ timeout: 8000 }).should('include', '/register')
  })
})