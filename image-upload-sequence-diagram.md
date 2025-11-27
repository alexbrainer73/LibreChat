# LibreChat - Diagrama de Sequência: Upload de Imagem até Resposta da LLM

## Diagrama de Sequência Completo

```mermaid
sequenceDiagram
    actor User as Usuário
    participant UI as Frontend UI<br/>(FileUpload.tsx)
    participant Hook as useFileHandling<br/>Hook
    participant Upload as Upload Mutation<br/>(API Client)
    participant API as Backend API<br/>(/api/v1/files/images)
    participant Multer as Multer<br/>Middleware
    participant Process as Image Processor<br/>(processImageFile)
    participant Sharp as Sharp Library<br/>(Resize/Convert)
    participant Storage as File Storage<br/>(Local/Firebase/OpenAI)
    participant DB as Database<br/>(File Record)
    participant Chat as Chat Hook<br/>(useChatFunctions)
    participant SSE as SSE Client<br/>(useSSE)
    participant ChatAPI as Chat API<br/>(/api/ask)
    participant Builder as Message Builder<br/>(buildMessages)
    participant Encoder as Image Encoder<br/>(encodeAndFormat)
    participant LLM as LLM Provider<br/>(OpenAI/Anthropic/Google)
    participant Events as SSE Events<br/>(useEventHandlers)

    %% ===== FASE 1: UPLOAD DE IMAGEM =====
    Note over User,DB: FASE 1: Upload e Processamento da Imagem

    User->>UI: 1. Seleciona/Arrasta Imagem
    activate UI
    UI->>Hook: 2. handleFileChange(file)
    activate Hook

    Hook->>Hook: 3. validateFiles()<br/>- Valida MIME type<br/>- Valida tamanho<br/>- Valida limite de arquivos

    Hook->>Hook: 4. loadImage()<br/>- Cria URL preview<br/>- Obtém dimensões (width/height)

    Hook->>UI: 5. Atualiza estado com preview
    UI->>User: 6. Mostra preview da imagem
    deactivate UI

    Hook->>Upload: 7. startUpload(file)<br/>FormData: {file, file_id, width, height, endpoint}
    activate Upload

    Upload->>API: 8. POST /api/v1/files/images<br/>Content-Type: multipart/form-data
    activate API

    API->>Multer: 9. Recebe upload
    activate Multer
    Multer->>Multer: 10. Salva em /uploads/temp/userId/<br/>Gera file_id (UUID)
    Multer->>API: 11. Retorna file info
    deactivate Multer

    API->>Process: 12. processImageFile(file)
    activate Process

    Process->>Sharp: 13. convertImage()<br/>- Resize baseado em resolução<br/>- Converte para formato config
    activate Sharp
    Sharp->>Sharp: 14. Processa imagem<br/>(redimensiona, otimiza)
    Sharp->>Storage: 15. Salva imagem processada
    activate Storage
    Storage->>Sharp: 16. Retorna filepath
    deactivate Storage
    Sharp->>Process: 17. Retorna {filepath, bytes, width, height}
    deactivate Sharp

    Process->>DB: 18. Cria registro File<br/>{user, file_id, filepath, type, width, height, bytes}
    activate DB
    DB->>Process: 19. Confirma salvamento
    deactivate DB

    Process->>API: 20. Retorna metadata
    deactivate Process

    API->>Upload: 21. Response 200<br/>{file_id, filepath, width, height, type}
    deactivate API

    Upload->>Hook: 22. onSuccess(fileData)
    deactivate Upload

    Hook->>Hook: 23. updateFileById()<br/>- Atualiza progresso para 100%<br/>- Salva filepath
    Hook->>UI: 24. Atualiza UI
    deactivate Hook
    activate UI
    UI->>User: 25. Mostra imagem carregada<br/>(progresso 100%)
    deactivate UI

    %% ===== FASE 2: ENVIO DA MENSAGEM COM IMAGEM =====
    Note over User,Events: FASE 2: Composição e Envio da Mensagem

    User->>UI: 26. Digita mensagem e envia
    activate UI
    UI->>Chat: 27. submitMessage()
    activate Chat

    Chat->>Chat: 28. Cria userMessage com files<br/>files: [{file_id, filepath, type, width, height}]

    Chat->>SSE: 29. sendMessage(submission)<br/>{userMessage, endpointOption, files}
    activate SSE
    deactivate Chat
    deactivate UI

    SSE->>ChatAPI: 30. POST /api/ask<br/>Content-Type: application/json<br/>Authorization: Bearer token
    activate ChatAPI

    ChatAPI->>ChatAPI: 31. buildEndpointOption()<br/>endpointOption.attachments = processFiles(files)

    ChatAPI->>Builder: 32. buildMessages()<br/>- Detecta vision request<br/>- Seleciona modelo vision
    activate Builder

    Builder->>Encoder: 33. encodeAndFormat(files, endpoint)
    activate Encoder

    Encoder->>Storage: 34. Obtém imagem do storage
    activate Storage
    Storage->>Encoder: 35. Retorna buffer/base64
    deactivate Storage

    Encoder->>Encoder: 36. Formata por provider:<br/><br/>OpenAI:<br/>{type: 'image_url',<br/>image_url: {url: 'data:image/...;base64,...', detail: 'auto'}}<br/><br/>Anthropic:<br/>{type: 'image',<br/>source: {type: 'base64', media_type: '...', data: '...'}}<br/><br/>Google:<br/>{inlineData: {mimeType: '...', data: '...'}}

    Encoder->>Builder: 37. Retorna {files[], image_urls[]}
    deactivate Encoder

    Builder->>Builder: 38. formatVisionMessage()<br/>- Cria content array<br/>- Combina texto + imagens

    Builder->>ChatAPI: 39. Retorna payload formatado
    deactivate Builder

    %% ===== FASE 3: PROCESSAMENTO PELA LLM =====
    Note over ChatAPI,Events: FASE 3: Processamento pela LLM e Resposta

    ChatAPI->>LLM: 40. sendCompletion(payload)<br/>Mensagem com imagem codificada
    activate LLM

    LLM->>LLM: 41. Modelo Vision processa:<br/>- Analisa imagem<br/>- Gera resposta baseada em imagem + texto

    LLM->>ChatAPI: 42. Stream: chunk 1 (SSE)
    ChatAPI->>Events: 43. event: 'message'<br/>data: {text: "..."}
    activate Events
    Events->>UI: 44. Atualiza mensagem parcial
    activate UI
    UI->>User: 45. Mostra texto streaming
    deactivate UI
    deactivate Events

    LLM->>ChatAPI: 46. Stream: chunk 2 (SSE)
    ChatAPI->>Events: 47. event: 'message'
    activate Events
    Events->>UI: 48. Atualiza mensagem
    activate UI
    UI->>User: 49. Atualiza texto
    deactivate UI
    deactivate Events

    LLM->>ChatAPI: 50. Stream: chunk N (final)
    deactivate LLM

    ChatAPI->>DB: 51. Salva mensagens<br/>(user message + assistant response)
    activate DB
    DB->>ChatAPI: 52. Confirma
    deactivate DB

    ChatAPI->>Events: 53. event: 'final'<br/>data: {messageId, text, conversationId}
    activate Events
    deactivate ChatAPI

    Events->>UI: 54. Atualiza mensagem final
    activate UI
    deactivate SSE

    UI->>User: 55. Exibe resposta completa da LLM
    deactivate UI
    deactivate Events
```

## Detalhamento dos Componentes Principais

### 1. Frontend - Upload de Imagem

**Componentes-chave:**
- `FileUpload.tsx` - Interface de upload
- `useFileHandling.ts` - Lógica de validação e upload
- `ImagePreview.tsx` - Preview da imagem

**Validações realizadas:**
- Tipo MIME permitido
- Tamanho do arquivo (< fileSizeLimit)
- Tamanho total de todos arquivos (< totalSizeLimit)
- Número de arquivos (< fileLimit)
- Duplicatas

### 2. Backend - Processamento de Imagem

**Tecnologias:**
- **Multer**: Upload de arquivos multipart
- **Sharp**: Redimensionamento e conversão de imagens
- **Estratégias de Storage**: Local, Firebase, OpenAI, Azure

**Processamento:**
1. Recebe arquivo via Multer
2. Redimensiona baseado em resolução configurada
3. Converte para formato configurado (JPEG, PNG, WebP)
4. Salva no storage escolhido
5. Cria registro no banco de dados

### 3. Codificação por Provider LLM

**OpenAI (GPT-4 Vision):**
```javascript
{
  type: "image_url",
  image_url: {
    url: "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    detail: "auto" // ou "low" ou "high"
  }
}
```

**Anthropic (Claude 3):**
```javascript
{
  type: "image",
  source: {
    type: "base64",
    media_type: "image/jpeg",
    data: "/9j/4AAQSkZJRg..."
  }
}
```

**Google (Gemini):**
```javascript
{
  inlineData: {
    mimeType: "image/jpeg",
    data: "/9j/4AAQSkZJRg..."
  }
}
```

### 4. Fluxo de Dados Resumido

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. UPLOAD                                                       │
│    User → UI → Validation → API → Multer → Sharp → Storage     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. COMPOSIÇÃO                                                   │
│    User Message + Files → buildMessages → encodeAndFormat      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. ENVIO PARA LLM                                              │
│    Formatted Payload → LLM Provider API (OpenAI/Claude/Gemini) │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. RESPOSTA                                                     │
│    LLM Stream → SSE Events → Frontend → Display to User        │
└─────────────────────────────────────────────────────────────────┘
```

## Arquivos-chave no Código

### Frontend
- `client/src/components/Chat/Input/Files/FileUpload.tsx`
- `client/src/hooks/Files/useFileHandling.ts`
- `client/src/hooks/Chat/useChatFunctions.ts`
- `client/src/hooks/SSE/useSSE.ts`
- `client/src/hooks/SSE/useEventHandlers.ts`

### Backend
- `api/server/routes/files/images.js`
- `api/server/routes/files/multer.js`
- `api/server/services/Files/process.js`
- `api/server/services/Files/images/convert.js`
- `api/server/services/Files/images/encode.js`
- `api/app/clients/OpenAIClient.js`
- `api/app/clients/AnthropicClient.js`
- `api/app/clients/GoogleClient.js`
- `api/app/clients/prompts/formatMessages.js`

## Configurações Importantes

### Variáveis de Ambiente (.env)
- `IMAGE_OUTPUT_TYPE` - Formato de saída (jpeg, png, webp)
- `FILE_STRATEGY` - Estratégia de storage (local, firebase, openai)

### Limites (librechat.yaml)
- `fileSizeLimit` - Tamanho máximo por arquivo
- `totalSizeLimit` - Tamanho total de todos arquivos
- `fileLimit` - Número máximo de arquivos
- `supportedMimeTypes` - Tipos MIME permitidos
