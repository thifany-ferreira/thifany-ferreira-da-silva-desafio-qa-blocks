import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { buildUser, VALID_PASSWORD } from '../utils/userFactory';

const MSG = {
  invalidEmail: 'This is not a valid email.',
  passwordsMismatch: 'Passwords must match',
};

test.describe('Cadastro de usuário - Blocks', () => {
  let register: RegisterPage;

  test.beforeEach(async ({ page }) => {
    register = new RegisterPage(page);
    await register.goto();
  });

  test('1. Cadastro com sucesso', async ({ page }) => {
    const user = buildUser();

    await register.fillForm(user);
    await register.acceptTerms();
    await expect(register.submitButton).toBeEnabled();

    await register.submit();

    // Após criar a conta, o app redireciona para /welcome (ou /login).
    await expect(page).toHaveURL(/\/(welcome|login)/, { timeout: 30_000 });
    await expect(page.getByText('Este email já está em uso.')).toHaveCount(0);
  });

  // Obs.: o título não leva o e-mail porque o Playwright interpreta "@palavra" como tag.
  const invalidEmails = [
    { caso: 'sem arroba', email: 'email-invalido' },
    { caso: 'sem domínio', email: 'teste@' },
    { caso: 'sem usuário', email: '@example.com' },
    { caso: 'arroba duplicado', email: 'teste@@example.com' },
  ];

  for (const { caso, email: invalidEmail } of invalidEmails) {
    test(`2. Email inválido - ${caso}`, async ({ page }) => {
      await register.fillForm(buildUser({ email: invalidEmail }));
      await register.acceptTerms();

      await expect(register.errorMessage(MSG.invalidEmail)).toBeVisible();
      await expect(register.submitButton).toBeDisabled();
      await expect(page).toHaveURL(/\/registrar/);
    });
  }

  test('3. Senha e confirmação diferentes', async ({ page }) => {
    await register.fillForm(buildUser({ password: VALID_PASSWORD, confirmPassword: 'Outra@12345' }));
    await register.acceptTerms();

    await expect(register.errorMessage(MSG.passwordsMismatch)).toBeVisible();
    await expect(register.submitButton).toBeDisabled();
    await expect(page).toHaveURL(/\/registrar/);
  });

  test('4. Sem aceitar os termos de uso o cadastro não é realizado', async ({ page }) => {
    await register.fillForm(buildUser());

    // Termos desmarcados -> botão bloqueado
    await expect(register.termsCheckbox.locator('svg.lucide-check')).toHaveCount(0);
    await expect(register.submitButton).toBeDisabled();

    // Tentativa de clique não submete
    await register.submitButton.click({ force: true });
    await expect(page).toHaveURL(/\/registrar/);

    // Prova de que os termos são o único bloqueio: marcar habilita, desmarcar bloqueia de novo
    await register.acceptTerms();
    await expect(register.submitButton).toBeEnabled();
    await register.termsCheckbox.click();
    await expect(register.submitButton).toBeDisabled();
  });
});
