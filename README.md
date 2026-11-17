# AcessoComunidade — MVP de Controle de Portaria Acessível

MVP desenvolvido para otimizar o credenciamento e a validação de entrada em eventos comunitários, gerando tokens únicos em QR Code e realizando check-in rápido na portaria via navegador.

## Funcionalidades
- **Inscrição Simplificada:** Cadastro de participantes com geração instantânea de token único e QR Code.
- **Leitor de Portaria:** Validação via câmera do navegador (`html5-qrcode`) com bloqueio automático de duplicidade (`CREDENCIAL JÁ UTILIZADA`).
- **Interface Acessível:** Feedback visual de alto contraste (`ENTRADA LIBERADA` / `CREDENCIAL INVÁLIDA`), alerta de restrições alimentares e botões com altura mínima de 44px.

## Tecnologias Utilizadas
- **Backend:** Node.js, Express
- **Banco de Dados:** PostgreSQL (Supabase)
- **Frontend:** HTML5, Bootstrap 5, JavaScript (ES6+), `qrcode.js`, `html5-qrcode`

## Estrutura do Projeto
```text 
acesso-comunidade/
├── public/
│   ├── index.html      # Formulário de inscrição e geração de QR Code
│   ├── portaria.html   # Interface do voluntário (leitor e modal de status)
│   └── app.js          # Lógica de integração com a API e câmera
├── .env.example        # Modelo de variáveis de ambiente
├── .gitignore          # Arquivos ignorados pelo Git
├── package.json        # Dependências do projeto
└── server.js           # Servidor Express e rotas REST


git add README.md
git commit -m "docs: adiciona documentação das rotas REST e fluxo de validação no README.md"