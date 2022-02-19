# guarita-whatsapp

Micro serviço para entrega de mensagem no whatsapp via [MAXBOT](https://mbr.maxbot.com.br/doc-api-v1.php)

## Motivação

Estamos tendo problemas nas entragas de mensagens pelo servidor da AVATAR, está muito dificil depurar o motivo.
Precisamos de um server responsável apenas por essas entregas.

---

### Funcionalidades
- [x] Deve haver uma forma de enfileiramento de mensagens **(queue)**

#### Rotas

- [x] Middlewere de proteção de rotas
- [x] Uma rota privada para adquirir um tokem **JWT** permanente que será utilizado por outra aplicação. Essa rota só poderá funcionar em modo *DEV*.

- [ ] Contatos
  - [ ] **POST** e **PATCH** para criar ou atualizar um contato na lista de contatos
  - [ ] **GET** para adquirir dados do contato
  - [ ] **GET** para verificar se contato esta cadastrado
- [ ] Envio de mensagem
  - [x] Apenas uma rota POST para receber o conteúdo da mensagem a ser enviada ao destinatário
  `{url}/send/{contactId}` 
  **payload**
  ```typescript
  {
      provider: "maxbot"; // apenas maxbot por enquanto
      contactId: string;
      type: "text" | "image";
      message?: string; // sem texto quando for imagem
  }
  ```
### Techs/Libs sugeridas

- Server HTTP `express`, `jsonwebtoken`
- Log HTTP `morgan`
- Validação de dados `celebrate`
- Log de envios `winston`, `winston-daily-rotate-file` (Por enquanto, depois podemos aplicar ao banco de dados). Veja [winston](https://medium.com/@akshaypawar911/how-to-use-winston-daily-rotate-file-logger-in-nodejs-1e1996d2d38)
- Fila de execuções de promisses [p-queue](https://www.npmjs.com/package/p-queue)
- Envio de mensagem whatsapp [maxbotjs](https://github.com/leguass7/maxbotjs)
- Fluxo de commits e versionamento do `git flow`


#### Estrutura padrão (por funcionalidade)
- src
  - config
  - providers
    - **MaxBot**
  - helpers
  - **useCases**
    - queue
      - queue.dto.ts
      - queue.service.ts
    - send
      - send.dto.ts
      - send.controller.ts
      - send.validation.ts
      - send.service.ts
    - contact
      - contact.dto.ts
      - contact.controller.ts
      - contact.validation.ts
      - contact.service.ts


