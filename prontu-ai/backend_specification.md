# Prontu.ai — Especificação do Back-end

Esta documentação descreve os requisitos de API e os modelos de dados necessários para suportar o frontend React do Prontu.ai. Todas as rotas devem seguir os padrões RESTful e retornar dados em formato JSON.

## 🗄️ Modelos de Dados (Entidades)

### 1. Médico (Doctor)
- `id`: UUID
- `name`: string
- `specialty`: string
- `crm`: string
- `email`: string (unique)
- `phone`: string
- `whatsappConnected`: boolean
- `avatar`: string (iniciais ou URL)

### 2. Paciente (Patient)
- `id`: UUID
- `name`: string
- `cpf`: string (unique)
- `dob`: date (YYYY-MM-DD)
- `gender`: enum ('M', 'F', 'Other')
- `email`: string
- `phone`: string
- `bloodType`: string
- `allergies`: string[]
- `chronicConditions`: string[]
- `status`: enum ('active', 'inactive')
- `whatsappSynced`: boolean (se o paciente já permitiu integração)
- `lastVisit`: datetime

### 3. Prontuário / Consulta (Consultation)
- `id`: UUID
- `patientId`: UUID (FP)
- `doctorId`: UUID (FK)
- `date`: datetime
- `type`: string (Ex: 'Retorno', 'Primeira Consulta')
- `via`: enum ('web', 'whatsapp', 'presencial')
- `transcript`: text (transcrição do áudio ou texto digitado)
- `aiSummary`: text (resumo gerado por IA)
- `diagnosis`: text
- `cid`: string[] (códigos CID-10/11)
- `medications`: string[] (lista de prescrições)
- `exams`: string[] (lista de exames solicitados)
- `nextVisit`: date

### 4. Agenda (Appointment)
- `id`: UUID
- `patientId`: UUID
- `doctorId`: UUID
- `date`: date
- `time`: time
- `duration`: integer (minutos)
- `type`: string
- `status`: enum ('confirmed', 'pending', 'cancelled')
- `via`: enum ('presencial', 'telehealth')

### 5. Mensagem WhatsApp (WhatsAppMessage)
- `id`: UUID
- `chatId`: string (ID do WhatsApp)
- `from`: enum ('patient', 'doctor', 'bot', 'system')
- `content`: text
- `type`: enum ('text', 'audio', 'image')
- `timestamp`: datetime
- `read`: boolean

---

## 🚀 Endpoints da API (REST)

### Autenticação & Perfil
- `POST /auth/login`: Autenticação e retorno de Token JWT.
- `GET /me`: Detalhes do médico logado.
- `PATCH /me`: Atualização de perfil e configurações.

### Dashboard
- `GET /stats`: Retorna os cards do dashboard (Total pacientes, consultas hoje, mensagens pendentes, etc).
- `GET /stats/weekly`: Retorna a contagem de consultas dos últimos 7 dias para o gráfico.

### Pacientes
- `GET /patients`: Listagem com suporte a filtros (`query`, `status`, `whatsappSynced`).
- `POST /patients`: Criação de novo paciente.
- `GET /patients/:id`: Detalhes de um paciente específico.
- `GET /patients/:id/history`: Histórico completo de consultas (prontuário).
- `PATCH /patients/:id`: Atualização de dados.

### Agenda
- `GET /appointments`: Lista de consultas filtrada por data.
- `POST /appointments`: Agendamento de nova consulta.
- `PATCH /appointments/:id`: Alteração de status ou horário.

### WhatsApp & IA
- `GET /whatsapp/messages`: Histórico de conversas recentes.
- `POST /whatsapp/process-audio`: Ponto central onde o áudio (blob) é enviado, transcrito via IA (Whisper/GPT) e gera o objeto `Consultation`.
- `GET /whatsapp/status`: Verifica se o webhook do WhatsApp está ativo.

---

## 🧠 Integração com IA

O fluxo esperado pela interface é:
1. Recebimento de áudio via WhatsApp ou Web.
2. O Backend envia para um motor de transcrição.
3. O Backend envia a transcrição para um LLM (GPT-4o/Claude) com um prompt estruturado para extrair:
    - **Sumário Clínico**
    - **Diagnóstico sugerido**
    - **Prescrições (Medicações)**
    - **Exames**
    - **Códigos CID**
4. O Backend salva a consulta e retorna o JSON estruturado para o Frontend.

---

## 🔐 Requisitos de Segurança
- Uso de **HTTPS** obrigatório.
- Autenticação via **JWT**.
- Conformidade com a **LGPD** (Brasil) para dados sensíveis de saúde.
- Criptografia de dados sensíveis em repouso se possível.
