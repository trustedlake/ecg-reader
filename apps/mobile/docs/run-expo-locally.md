# Rodar o app mobile (Expo) localmente

Guia validado em 2026-10-20 (Windows). Resultado esperado: tela de login "Leitor ECG" no navegador e no Expo Go.

## 1. Pré-requisitos

| Item | Detalhe |
|---|---|
| Repo atualizado | `git pull` em `main` (fluxo V1 do PR #4 já está nele) |
| Dependências | `npm ci` na **raiz** do repo (nunca `npm install --prefix apps/mobile`, veja "Armadilhas") |
| Celular | Expo Go, na **mesma rede Wi-Fi** do PC |

## 2. Configuração: `apps/mobile/.env` (gitignored)

```
EXPO_PUBLIC_API_BASE_URL=https://d1i155fprtk4at.cloudfront.net
RCT_METRO_PORT=8142
```

- `EXPO_PUBLIC_API_BASE_URL` é obrigatória no celular. Aponta para o **backend de produção** (CloudFront), não para um backend local.
- `RCT_METRO_PORT=8142` evita a porta padrão 8081 (cada projeto tem a sua porta).

## 3. Subir

```powershell
cd apps\mobile
npx expo start --lan --clear
```

| Onde abrir | Como |
|---|---|
| Navegador | `http://localhost:8142` |
| Expo Go | "Enter URL manually" -> `exp://<IP-do-PC>:8142` (veja com `ipconfig`) |

Se o celular não conectar, libere a porta 8142 no firewall do Windows (exige admin).
A primeira compilação do Metro demora; use `--clear` após mexer em `node_modules`.

## 4. Login

O login é usuário/e-mail e senha de uma conta do backend. As contas são criadas pelo dono do sistema no Django Admin. Não há conta de teste versionada.

## 5. Armadilhas (erros reais encontrados)

| Sintoma | Causa | Correção |
|---|---|---|
| Tela branca no navegador; log: `Incompatible React versions` (react 19.2.3 x react-dom 19.2.8) | Monorepo: `apps/mobile` fixa React 19.2.3, `apps/web` usa `^19.2.7`; o `react-dom` hoistado na raiz diverge do `react` aninhado do mobile | `npm ci` na raiz resolve (o `react-dom` 19.2.3 fica em `apps/mobile/node_modules`). O Expo Go nativo não é afetado. Correção definitiva: alinhar as versões de React entre web e mobile |
| `Unable to resolve "rsvp" from ...node_modules\shared\lib\shared.js` | `npm install --prefix apps/mobile` baixou o pacote **`shared` do registry npm** por cima do workspace `packages/shared` | `rm -rf apps/mobile/node_modules` e `npm ci` na raiz. Confira que `node_modules/shared` é symlink para `packages/shared` |
| `ERR_PACKAGE_PATH_NOT_EXPORTED ./rn-get-polyfills` | `npm install` na raiz sem lockfile atualizou o `react-native` hoistado | `npm ci` (respeita o lockfile) |

Regra: instalar dependências **sempre com `npm ci` na raiz**, sem `--prefix`, sem `--no-package-lock`.
