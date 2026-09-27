# Testes E2E – Cadastro Blocks

Automação do fluxo de cadastro de https://www.blocksrvt.com/pt/registrar com **Playwright + TypeScript**, usando o padrão **Page Object**.

## Como rodar

```bash
npm install
npx playwright install chromium
npm test              # headless
npm run test:headed   # com navegador visível
npm run test:ui       # modo interativo
npm run report        # relatório HTML
```

Variáveis opcionais:

| Variável       | Padrão                       | Uso                                  |
|----------------|------------------------------|--------------------------------------|
| `BASE_URL`     | `https://www.blocksrvt.com`  | Ambiente alvo                        |
| `EMAIL_DOMAIN` | `example.com`                | Domínio dos e-mails gerados          |

## Estrutura

```
pages/RegisterPage.ts   # Page Object: seletores e ações do formulário
utils/userFactory.ts    # Massa de dados (e-mail único por execução)
tests/register.spec.ts  # Cenários
playwright.config.ts    # Config (trace, vídeo e screenshot em falha)
```

## Cenários

| # | Cenário | Validação |
|---|---------|-----------|
| 1 | Cadastro com sucesso | Formulário completo + termos → redireciona para `/welcome` ou `/login` |
| 2 | Email inválido (4 variações) | Mensagem `This is not a valid email.` e botão desabilitado |
| 3 | Senhas diferentes | Mensagem `Passwords must match` e botão desabilitado |
| 4 | Sem aceitar termos | Botão desabilitado, clique não submete, URL continua em `/registrar`; marcar termos habilita (prova que é o único bloqueio) |

## Decisões e observações

- **E-mail único por execução** (`qa.cadastro.<timestamp>@example.com`) para evitar a falha "Este email já está em uso." em execuções repetidas.
- **Senha padrão** `Teste@12345` atende à regra do site: 9+ caracteres, maiúscula, minúscula, número e caractere especial.
- **Mensagens de erro em inglês**: a página está em `/pt`, mas a validação do formulário vem em inglês. Os testes validam o texto exibido hoje. Vale registrar como possível bug de i18n.
- **Erro de senhas diferentes** só aparece quando os demais campos estão válidos. Por isso os cenários negativos preenchem o formulário completo e alteram só o campo testado, isolando a causa do erro.
- **Checkbox e dropdowns são customizados** (`<button>` em vez de `<input>`/`<select>`), então os seletores usam o rótulo visível via XPath.
- **Campo País (autocomplete)** só filtra as opções com digitação real, então usa `pressSequentially` em vez de `fill`.
- **Execução com 1 worker**: os testes rodam em sequência para não sobrecarregar o site real e evitar instabilidade.
- **Títulos sem `@`**: o Playwright interpreta `@palavra` no título como tag, por isso os casos de e-mail inválido são descritos em texto.
- **Banner de cookies** é fechado com "Rejeitar não necessários", se aparecer.
- O cenário 1 **cria uma conta real** no ambiente de produção a cada execução.
