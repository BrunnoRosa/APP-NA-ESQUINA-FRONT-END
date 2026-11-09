# Deploy do front-end (Expo web) no Railway

O app web é gerado com `npm run build` (pasta `dist`) e servido pelo `server.js`
(só Node, sem dependências). O `Dockerfile` faz tudo isso sozinho.

## Variáveis do serviço do front
| Variável | Valor |
|---|---|
| `EXPO_PUBLIC_API_URL` | endereço público do back, ex.: `https://na-esquina-back.up.railway.app` (sem `/` no final) |

> Ela é lida **na hora do build**. Se mudar o endereço do back, faça um novo deploy do front.

## Passo a passo
1. No Railway, abra o projeto e crie os serviços na ordem: **MySQL**, **back-end**, **front-end**
   (veja a parte da equipe do back em `sugestoes-backend.txt`, seção E).
2. Back-end no ar: em *Settings > Networking*, clique em **Generate Domain** e copie o endereço `https://...up.railway.app`.
3. Novo serviço > *GitHub Repo* > `APP-NA-ESQUINA-FRONT-END` (branch `main` ou a combinada).
   O Railway detecta o `Dockerfile` sozinho.
4. Em *Variables*, crie `EXPO_PUBLIC_API_URL` com o endereço do back (passo 2).
5. *Settings > Networking > Generate Domain* para o front. Esse é o endereço que vai na apresentação.
6. Volte ao back e coloque o endereço do front em `CORS_ORIGINS` (se a equipe adotar a restrição de CORS).

## Testar o build no computador (opcional)
```
npm run build
node server.js
```
Abra http://localhost:3000. Para apontar para outro back: no PowerShell,
`$env:EXPO_PUBLIC_API_URL="https://seu-back.up.railway.app"` antes do `npm run build`.

## Desenvolvimento continua igual
Sem `EXPO_PUBLIC_API_URL`, o `api.js` usa `http://<host>:8080` como sempre.
