export type UserData = {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  familyLanguage: string;
  workField: string;
  origin: string;
  password: string;
  confirmPassword: string;
};

// Senha válida pela regra do site: 9+ caracteres, maiúscula, minúscula, número e especial.
export const VALID_PASSWORD = 'Teste@12345';

/** E-mail único por execução para não colidir com "Este email já está em uso." */
export function uniqueEmail(): string {
  const domain = process.env.EMAIL_DOMAIN ?? 'example.com';
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return `qa.cadastro.${suffix}@${domain}`;
}

export function buildUser(overrides: Partial<UserData> = {}): UserData {
  return {
    firstName: 'Teste',
    lastName: 'Automacao',
    email: uniqueEmail(),
    country: 'Brazil',
    familyLanguage: 'Famílias em Português',
    workField: 'Arquiteto',
    origin: 'Google',
    password: VALID_PASSWORD,
    confirmPassword: VALID_PASSWORD,
    ...overrides,
  };
}
