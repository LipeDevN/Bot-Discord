# Bot Discord de Cargos, Ranks e Anti-Flood

Este é um bot de Discord focado em programação, com sistema de cargos por reação, ranks automáticos, leaderboard, comandos administrativos, feedback visual, anti-flood e atribuição automática de cargos.

## Como rodar localmente

1. **Clone o repositório:**
   ```sh
   git clone https://github.com/LipeDevN/Bot-Discord.git
   cd Bot-Discord/discord-role-bot
   ```
2. **Instale as dependências:**
   ```sh
   npm install
   ```
3. **Crie um arquivo `.env`** com o token do seu bot:
   ```env
   TOKEN=seu_token_aqui
   ```
4. **Inicie o bot:**
   ```sh
   npm start
   ```

## Deploy no Railway (24/7)

1. Faça login em [Railway](https://railway.app/).
2. Crie um novo projeto e conecte seu repositório do GitHub.
3. Nas configurações do projeto Railway, defina o diretório de trabalho para `discord-role-bot`.
4. Em "Variables", adicione a variável `TOKEN` com o token do seu bot.
5. O Railway irá instalar as dependências e rodar o bot automaticamente.

## Estrutura
- `src/bot.js`: Arquivo principal do bot
- `src/commands/`: Comandos customizados
- `src/events/`: Eventos do Discord
- `src/utils/`: Funções utilitárias
- `config/`: Configurações customizáveis

## Segurança
- **Nunca suba seu `.env` para o GitHub!**
- Use sempre as variáveis de ambiente do Railway para produção.

---

Feito por LipeDevN
