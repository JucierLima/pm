# 🎖️ Policial Estudos - Plataforma de Estudos Gamificada

Plataforma de estudos para concursos policiais inspirada no Duolingo, desenvolvida com Node.js, Express, MongoDB e React.

## 🚀 Funcionalidades

- **Sistema de Autenticação**: Cadastro e login com JWT
- **8 Disciplinas**: Português, Raciocínio Lógico, Informática, Direito Constitucional, Direitos Humanos, História de Pernambuco, Legislação Extravagante, Legislação PMPE
- **3 Níveis de Dificuldade**: Fácil, Médio, Difícil
- **Modos de Estudo**: Estudo, Desafio, Simulado
- **Gamificação**: XP, patentes militares, rankings, conquistas
- **Sistema de Repetição**: Revisão automática de questões erradas
- **Design Responsivo**: Funciona em desktop, tablet e celular
- **PWA**: Instalável como aplicativo

## 📋 Pré-requisitos

- Node.js (v18+)
- MongoDB (local ou Atlas)
- npm ou yarn

## 🛠️ Instalação

1. **Clone o repositório**
```bash
cd policial-estudos
```

2. **Instale as dependências**
```bash
# Instala todas as dependências (raiz, server e client)
npm run install-all

# Ou instale manualmente:
cd server && npm install
cd ../client && npm install
```

3. **Configure o MongoDB**

Crie um arquivo `.env` na pasta `server/`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/policial_estudos
JWT_SECRET=sua_chave_secreta_aqui
```

4. **Popule o banco de dados** (opcional)
```bash
cd server
npm run start -- seed
# Ou: node seed.js
```

## ▶️ Executando o Projeto

### Desenvolvimento (ambos frontend e backend)
```bash
npm run dev
```

### Executar separadamente

**Backend:**
```bash
cd server
npm run dev
```
O backend estará em: http://localhost:5000

**Frontend:**
```bash
cd client
npm run dev
```
O frontend estará em: http://localhost:3000

## 🏗️ Estrutura do Projeto

```
policial-estudos/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── context/       # Contextos React (Auth, Theme)
│   │   ├── pages/         # Páginas da aplicação
│   │   └── styles/        # Estilos globais
│   └── ...
├── server/                 # Backend Node.js
│   ├── controllers/       # Controladores
│   ├── models/            # Modelos MongoDB
│   ├── routes/            # Rotas API
│   ├── middlewares/       # Middlewares
│   └── seed.js           # Script de seed
├── package.json           # Scripts gerais
└── README.md
```

## 📱 Patentes (Sistema de Gamificação)

| Patente | XP Necessário |
|---------|---------------|
| Soldado | 0 |
| Cabo | 300 |
| Sargento | 1.000 |
| Tenente | 2.500 |
| Capitão | 4.500 |
| Major | 7.000 |
| Coronel | 10.000 |

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/register` - Cadastro
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário

### Questões
- `GET /api/questions` - Listar questões
- `GET /api/questions/session` - Buscar questões para sessão
- `POST /api/questions/:id/answer` - Responder questão

### Progresso
- `GET /api/progress` - Progresso por matéria
- `POST /api/progress/attempt` - Salvar tentativa
- `GET /api/progress/stats` - Estatísticas
- `GET /api/progress/history` - Histórico

### Ranking
- `GET /api/ranking` - Ranking global
- `GET /api/ranking/me` - Posição do usuário

## 🛠️ Tecnologias

**Backend:**
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT (autenticação)
- bcrypt (criptografia)

**Frontend:**
- React
- Vite
- React Router
- Axios
- CSS Modules

## 📝 Licença

MIT License

