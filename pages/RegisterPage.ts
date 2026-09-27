import { expect, type Locator, type Page } from '@playwright/test';
import type { UserData } from '../utils/userFactory';

export class RegisterPage {
  readonly page: Page;
  readonly form: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly countryInput: Locator;
  readonly password: Locator;
  readonly confirmPassword: Locator;
  readonly termsCheckbox: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.locator('form').filter({ has: page.locator('#first_name') });
    this.firstName = page.locator('#first_name');
    this.lastName = page.locator('#last_name');
    this.email = page.locator('#email');
    this.countryInput = page.getByPlaceholder('Escolha o país');
    this.password = page.locator('#password');
    this.confirmPassword = page.locator('#confirm_password');
    // Checkbox customizado: <div><button/></div><span>Eu aceito a ...</span>
    this.termsCheckbox = this.form.locator(
      'xpath=.//span[starts-with(normalize-space(.), "Eu aceito")]/preceding-sibling::div//button',
    );
    this.submitButton = this.form.locator('button[type="submit"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/pt/registrar');
    await this.dismissCookieBanner();
    await expect(this.firstName).toBeVisible();
  }

  /** Fecha o banner de cookies, se aparecer (opção mais restritiva). */
  async dismissCookieBanner(): Promise<void> {
    const reject = this.page.getByRole('button', { name: 'Rejeitar não necessários' });
    try {
      await reject.waitFor({ state: 'visible', timeout: 5_000 });
      await reject.click();
    } catch {
      // Banner não exibido — segue o fluxo.
    }
  }

  /** Container de um campo pelo rótulo (label em <div class="text-sm">). */
  private field(label: string): Locator {
    return this.form.locator(`xpath=.//div[normalize-space(text())="${label}"]/parent::div`);
  }

  private async selectDropdown(label: string, option: string): Promise<void> {
    const container = this.field(label);
    await container.locator('button').first().click();
    await container.getByRole('button', { name: option, exact: true }).click();
    await expect(container.locator('button').first()).toContainText(option);
  }

  async selectCountry(country: string): Promise<void> {
    // Autocomplete só filtra com digitação real (teclas), não com fill().
    await this.countryInput.click();
    await this.countryInput.pressSequentially(country.slice(0, 4), { delay: 100 });
    const option = this.field('País').getByRole('button', { name: country, exact: true });
    await expect(option).toBeVisible();
    await option.click();
    await expect(this.countryInput).toHaveValue(country);
  }

  checkboxFor(text: string): Locator {
    return this.form.locator(
      `xpath=.//span[normalize-space(.)="${text}"]/preceding-sibling::div//button`,
    );
  }

  async check(checkbox: Locator): Promise<void> {
    await checkbox.click();
    await expect(checkbox.locator('svg.lucide-check')).toBeVisible();
  }

  async fillForm(user: UserData): Promise<void> {
    await this.firstName.fill(user.firstName);
    await this.lastName.fill(user.lastName);
    await this.email.fill(user.email);
    await this.selectCountry(user.country);
    await this.selectDropdown('Idioma da Família', user.familyLanguage);
    await this.check(this.checkboxFor(user.workField));
    await this.selectDropdown('Como você ficou sabendo sobre a Blocks?', user.origin);
    await this.password.fill(user.password);
    await this.confirmPassword.fill(user.confirmPassword);
    await this.confirmPassword.blur();
  }

  async acceptTerms(): Promise<void> {
    await this.check(this.termsCheckbox);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  errorMessage(text: string): Locator {
    return this.form.locator('span.text-red-600', { hasText: text });
  }
}
