Feature: Sample Feature
  As a user
  I want to visit the Playwright website
  So that I can learn about its features

@test
  Scenario: Visit the Playwright website
    Given I am on the Playwright website
    When I click the "Get started" button
    Then I should be on the "Installation | Playwright1" page

@login
  Scenario: Test site login
    Given I open the login page
    When I login with username "practice" and password "SuperSecretPassword!"
    Then I should see the dashboard