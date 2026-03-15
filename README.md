# Prontu.ai

Plataforma inteligente de prontuários médicos com integração via WhatsApp e inteligência artificial para diagnósticos e prescrições.

## 🚀 Quick Start

Para rodar o projeto localmente em ambiente de desenvolvimento, siga os passos abaixo:

### Pré-requisitos
- Node.js (v18+)
- Docker e Docker Compose
- Conta ativa no Supabase
- Instância do n8n (para gestão de webhooks do WhatsApp)

### Passo a passo

1. **Clone o repositório e instale as dependências:**
   ```bash
   cd prontu-ai
   npm install
   ```

2. **Configure as variáveis de ambiente:**
   Copie o arquivo `.env.example` para `.env.local` e preencha com suas credenciais:
   ```bash
   cp .env.example .env.local
   ```

3. **Inicie a aplicação localmente:**
   ```bash
   npm run dev
   ```

### Executando com Docker

Se preferir rodar toda a aplicação via contêineres:

```bash
cd prontu-ai
docker compose up -d --build
```
A aplicação estará disponível na porta `3000` (`http://localhost:3000`).

## ✨ Features

- **Gestão de Pacientes**: Cadastro completo, histórico de consultas e anamnese.
- **Agenda Inteligente**: Controle de consultas (presenciais ou telemedicina) e status de atendimento.
- **Integração com WhatsApp**: Envio e recebimento de mensagens diretamente da plataforma, permitindo uma comunicação fluida com o paciente.
- **Prontuário via Áudio (IA)**: Transcrição automatizada de áudios via IA (Whisper/GPT) transformados diretamente em dados estruturados do prontuário (Resumo Clínico, CID, Prescrições, Exames).
- **Dashboard e Estatísticas**: Visão geral de atendimentos, pacientes ativos, consultas na semana e mensagens pendentes.
- **Área Administrativa**: Gestão de usuários do sistema, médicos e configurações avançadas.

## ⚙️ Configuration

As principais variáveis de ambiente necessárias para rodar a aplicação estão descritas abaixo:

| Variável | Descrição | Exemplo / Padrão |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL da instância do Supabase (Autenticação/Banco de Dados) | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Chave pública anônima do Supabase | `ey...` |
| `VITE_N8N_BASE_URL` | URL base da sua instância n8n para webhooks | `https://n8n.meudominio.com` |
| `JWT_SECRET` | Segredo para assinatura de tokens (para serviços complementares) | `super_secret_key` |
| `OPENAI_API_KEY` | Chave de API da OpenAI para processamento de IA | `sk-...` |
| `WHATSAPP_WEBHOOK_SECRET` | Segredo para validar webhooks recebidos do WhatsApp | `webhook_secret` |

## 📚 Documentação

Para mais detalhes sobre a arquitetura, estrutura de dados e especificações do back-end, consulte:

- [Especificação do Back-end](./prontu-ai/backend_specification.md)

## 🤝 Contributing

1. Faça um Fork do projeto
2. Crie sua Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Faça o Commit de suas alterações (`git commit -m 'Add some AmazingFeature'`)
4. Faça o Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 License

Este projeto é proprietário. Todos os direitos reservados à equipe EJI.