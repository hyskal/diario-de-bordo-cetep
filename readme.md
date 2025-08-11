**Sistema de Envio de Diário de Bordo**

Este projeto é uma aplicação web de página única (SPA) desenvolvida para o CETEP, com o objetivo de simplificar o envio de diários de bordo por parte dos estudantes. O sistema permite que os alunos preencham suas informações, selecionem até seis fotos e, em seguida, gere um arquivo PDF otimizado que é automaticamente enviado para o Firebase Storage.

## Visão Geral do Sistema

O aplicativo oferece uma interface limpa e responsiva onde os usuários podem:

  * Inserir informações do estudante, como nome(s) e turma.
  * Adicionar ou remover múltiplos campos para nomes de estudantes.
  * Selecionar até seis fotos para compor o diário de bordo.
  * O sistema comprime as imagens localmente antes de enviá-las para a API do ImgBB.
  * Um PDF é gerado dinamicamente com base no número de fotos selecionadas (grade 2x2 para até 4 fotos, e 2x3 para 5 a 6 fotos).
  * A logomarca do CETEP é inserida no canto superior direito do PDF.
  * O arquivo PDF final é enviado para o Firebase Storage.
  * Alerta de Confirmação: Após o upload, um alerta informa ao usuário sobre o envio bem-sucedido e oferece um botão para baixar uma cópia local.
  * Design Responsivo: Layout otimizado para dispositivos móveis e desktops.

## Tecnologias Utilizadas

  * Frontend: HTML5, CSS3 e JavaScript
  * Geração de PDF: [jsPDF](https://www.google.com/search?q=https://jspdf.org/)
  * Compressão de Imagens: [Compressor.js](https://github.com/fengyuanchen/compressorjs)
  * Hospedagem e Armazenamento: [Firebase](https://firebase.google.com/) (Hosting e Storage)
  * Hospedagem de Imagens: [ImgBB API](https://api.imgbb.com/)

## Configuração do Ambiente

### 1\. Configuração do Firebase

1.  **Crie um Projeto no Firebase**: Acesse o [Console do Firebase](https://console.firebase.google.com/) e crie um novo projeto.
2.  **Ative o Firebase Storage**: No painel do seu projeto, vá em **Build \> Storage** e clique em "Começar". Siga as instruções para configurar as regras de segurança e o bucket.
3.  **Obtenha as Credenciais**: Vá em **Configurações do Projeto \> Geral** e adicione um aplicativo da web (clicando em `</>`). Copie as configurações do Firebase e insira-as no `<script>` do `index.html`.

**Exemplo de script com placeholders:**

```html
<script>
    var firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };
    firebase.initializeApp(firebaseConfig);
    const storage = firebase.storage();
</script>
```

> **Atenção**: Substitua os valores dos placeholders (`YOUR_API_KEY`, `YOUR_PROJECT_ID`, etc.) pelos dados do seu projeto Firebase.

### 2\. Configuração do ImgBB

Este projeto utiliza a API do ImgBB para hospedar temporariamente as imagens antes de serem processadas no PDF.

1.  **Crie uma Conta no ImgBB**: Acesse o site do [ImgBB](https://api.imgbb.com/) e obtenha sua chave de API.
2.  **Insira a Chave no Código**: Cole sua chave de API na constante `IMGBB_API_KEY` no arquivo `script.js`.

**Exemplo de script com placeholder (em script.js):**

```javascript
const IMGBB_API_KEY = 'YOUR_IMGBB_API_KEY';
```

## Trechos de Código Principais

A lógica de manipulação do DOM e a funcionalidade de geração e upload do PDF foram movidas para o arquivo `script.js` para melhor organização e manutenção.

**Lógica de Adicionar/Remover Nomes de Estudantes**

Este trecho do código, agora localizado em `script.js`, gerencia a adição e remoção dinâmica dos campos de nome, garantindo uma lista concatenada para o cabeçalho do PDF.

```javascript
// Lógica para adicionar e remover campos de nome (em script.js)
const addStudentBtn = document.getElementById('add-student-btn');
const removeStudentBtn = document.getElementById('remove-student-btn');
const studentNamesGroup = document.getElementById('student-names-group');

addStudentBtn.addEventListener('click', () => {
    // ...
});

removeStudentBtn.addEventListener('click', () => {
    // ...
});
```

**Lógica Dinâmica do PDF e Upload**

Este é o trecho central do código, responsável por gerar o PDF, redimensionar as imagens, configurar a grade (2x2 ou 2x3) e enviar o arquivo para o Firebase. Este código também está no arquivo `script.js`.

```javascript
// A lógica completa está agora em script.js
document.getElementById('gerar-pdf').addEventListener('click', function() {
    // ... (lógica do formulário, processamento de imagens e upload) ...
});
```
