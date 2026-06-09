**Sistema de Envio de Diário de Bordo**

Este projeto é uma aplicação web de página única (SPA) desenvolvida para o CETEP/LNAB, com o objetivo de simplificar o envio das fotos dos diários de bordo por parte dos estudantes. O sistema permite que os alunos preencham suas informações, selecionem até seis fotos e, em seguida, gere um arquivo PDF otimizado que é automaticamente enviado para o Firebase Storage e, em paralelo, para a SML Storage API.

## Visão Geral do Sistema

O aplicativo oferece uma interface limpa e responsiva onde os usuários podem:

  * Inserir informações do estudante, como nome(s) e turma.
  * Adicionar ou remover múltiplos campos para nomes de estudantes.
  * Selecionar até seis fotos numa única área de arrastar e soltar.
  * O sistema comprime as imagens localmente antes de gerar o PDF.
  * Um PDF é gerado dinamicamente com grade 2x2 (até 4 fotos) ou 2x3 (5-6 fotos).
  * A logomarca do CETEP é inserida no canto superior direito do PDF.
  * O PDF é enviado simultaneamente para o Firebase Storage e para a SML Storage API.
  * Modal de confirmação com SVG animado e botão para baixar cópia local.
  * Design responsivo para dispositivos móveis e desktops.

## Tecnologias Utilizadas

  * Frontend: HTML5, CSS3 e JavaScript
  * Geração de PDF: [jsPDF](https://jspdf.org/)
  * Hospedagem e Armazenamento: [Firebase](https://firebase.google.com/) (Hosting, Storage e Functions)
  * Upload paralelo: [SML Storage API](https://us-east1-sml-storage.cloudfunctions.net)

---

## Configuração do Ambiente

### 1. Configuração do Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/) e crie um novo projeto.
2. Ative o **Firebase Storage**: vá em **Build > Storage** e clique em "Começar".
3. Obtenha as credenciais em **Configurações do Projeto > Geral**, adicione um app web e copie o `firebaseConfig` para o `index.html`.
4. Ative o plano **Blaze** (pay-as-you-go) — necessário para Cloud Functions.

---

### 2. Deploy da Cloud Function (proxy SML Storage)

A função `smlUpload` serve como proxy seguro para a SML Storage API, mantendo a chave de API fora do frontend.

#### Passo 1 — Habilitar APIs no Google Cloud Console

Acesse o [Console do Google Cloud](https://console.cloud.google.com) no projeto e habilite manualmente:

- [Cloud Build API](https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com)
- [Artifact Registry API](https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com)
- [Cloud Billing API](https://console.cloud.google.com/apis/library/cloudbilling.googleapis.com)

#### Passo 2 — Criar o Secret no Secret Manager

Acesse o [Secret Manager](https://console.cloud.google.com/security/secret-manager) e crie:

- **Nome:** `SML_API_KEY`
- **Valor:** `<sua chave da SML Storage API>`

#### Passo 3 — Permissões IAM para o GitHub Actions

Se usar GitHub Actions para deploy, acesse [IAM](https://console.cloud.google.com/iam-admin/iam) e adicione os seguintes papéis à conta de serviço do GitHub Actions (`github-action-...@<projeto>.iam.gserviceaccount.com`):

- Desenvolvedor do Cloud Functions
- Gravador do Artifact Registry
- Usuário da conta de serviço
- Administrador de uso do serviço

#### Passo 4 — Deploy via Cloud Shell (recomendado)

Abra o [Cloud Shell](https://console.cloud.google.com) no projeto e execute:

```bash
git clone https://github.com/hyskal/diario-de-bordo-cetep.git
cd diario-de-bordo-cetep/functions
npm install
cd ..
firebase deploy --only functions --project diario-de-bordo-cetep
```

Quando perguntado `How many days do you want to keep container images?`, digite **1**.

Após o deploy, a função estará disponível em:
```
https://us-central1-diario-de-bordo-cetep.cloudfunctions.net/smlUpload
```

#### Passo 5 — Permissão de acesso ao Secret (automática)

O Firebase CLI concede automaticamente acesso ao secret `SML_API_KEY` durante o deploy. Caso precise fazer manualmente via Cloud Shell:

```bash
gcloud secrets add-iam-policy-binding SML_API_KEY \
  --project=diario-de-bordo-cetep \
  --member="serviceAccount:<numero>-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

### 3. GitHub Actions (deploy automático)

O repositório inclui dois workflows:

| Workflow | Arquivo | Disparado por |
|---|---|---|
| Deploy Hosting (merge) | `firebase-hosting-merge.yml` | Push no `main` |
| Deploy Hosting (PR) | `firebase-hosting-pull-request.yml` | Pull Request |
| Deploy Functions | `firebase-functions-deploy.yml` | Push em `functions/**` ou manual |

**Secret necessário no repositório GitHub:**

| Nome | Descrição |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT_DIARIO_DE_BORDO_CETEP` | JSON completo da conta de serviço do Firebase |

Adicione em: `github.com/<usuario>/<repo>/settings/secrets/actions`

---

## Estrutura do Projeto

```
diario-de-bordo-cetep/
  .github/workflows/        ← GitHub Actions
  functions/
    index.js                ← Cloud Function smlUpload (proxy SML)
    package.json
  public/
    index.html              ← Interface principal
    script.js               ← Lógica de geração de PDF e upload
    logo-cetep-lnab.png
    admin.html
  firebase.json
  readme.md
```


