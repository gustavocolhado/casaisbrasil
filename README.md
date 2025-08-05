# D4swing - Rede Social

Este é um projeto Next.js que replica a interface de uma rede social com tema escuro, exatamente como mostrado na imagem de referência.

## Características

- **Interface de 3 colunas**: Sidebar esquerda para navegação, área central para posts, sidebar direita para mensagens
- **Tema escuro**: Design moderno com cores escuras
- **Responsivo**: Layout adaptável para desktop e mobile
- **Tailwind CSS**: Estilização com Tailwind CSS
- **TypeScript**: Desenvolvido em TypeScript
- **Lucide React**: Ícones modernos
- **Arquitetura de Componentes**: Código organizado e reutilizável
- **Página de Perfil**: Perfil completo do usuário com banner, estatísticas e posts
- **Backend Real**: Integração com Prisma, MongoDB e APIs REST
- **Dados Dinâmicos**: Posts, usuários e mensagens vindos do banco de dados

## Estrutura da Interface

### Desktop (Telas > 768px)
- **Sidebar Esquerda**: Logo D4swing, menu de navegação, botão "Publicar", toggle de tema
- **Área Central**: Header "Página inicial", abas de navegação, feed de posts
- **Sidebar Direita**: Abas INBOX/ARQUIVADAS, lista de mensagens

### Mobile (Telas < 768px)
- **Top Bar**: Logo D4swing + rabo de diabo, ícone de edição
- **Abas de Navegação**: Seguindo, Para você, Todos
- **Feed de Posts**: Posts otimizados para mobile
- **Navegação Inferior**: 5 ícones (Página inicial, Pesquisar, Notificações, Chat, Você)
- **URL no Rodapé**: "https://d4swing.com/home"

### Página de Perfil
- **Header**: Botão voltar, nome do usuário, botões Seguir/Mensagem/Opções
- **Banner**: Duas imagens de fundo com foto de perfil centralizada
- **Estatísticas**: Visualizações, seguindo, seguidores, recomendações
- **Informações**: Gênero, localização, distância, preferências, membro desde, status
- **Abas**: Principal (posts) e Fotos (13 fotos)
- **Posts**: Feed de posts específicos do usuário
- **URL Dinâmica**: `/profile/[username]` - acessa perfil de qualquer usuário

## Estrutura do Projeto

```
confissoesnovo/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── api/                    # APIs REST
│   │   ├── auth/
│   │   ├── posts/
│   │   ├── users/
│   │   ├── messages/
│   │   └── ...
│   └── profile/
│       └── [username]/
│           └── page.tsx        # Página de perfil dinâmica
├── components/
│   ├── layout/
│   │   ├── DesktopLayout.tsx
│   │   ├── MobileLayout.tsx
│   │   ├── LeftSidebar.tsx
│   │   ├── MainContent.tsx
│   │   ├── RightSidebar.tsx
│   │   ├── TopBar.tsx
│   │   ├── NavigationTabs.tsx
│   │   └── BottomNavigation.tsx
│   ├── posts/
│   │   ├── PostsFeed.tsx
│   │   └── PostCard.tsx
│   ├── messages/
│   │   └── MessageList.tsx
│   └── profile/
│       ├── DesktopProfileLayout.tsx
│       ├── MobileProfileLayout.tsx
│       ├── ProfileHeader.tsx
│       ├── ProfileBanner.tsx
│       ├── ProfileInfo.tsx
│       ├── ProfileTabs.tsx
│       └── ProfilePostCard.tsx
├── lib/
│   ├── prisma.ts              # Cliente Prisma
│   ├── auth.ts                # Autenticação
│   ├── notifications.ts       # Notificações
│   ├── socketContext.tsx      # WebSocket
│   └── api/                   # Funções de API
│       ├── posts.ts
│       ├── users.ts
│       └── messages.ts
├── prisma/
│   └── schema.prisma          # Schema do banco MongoDB
├── data/                      # Dados mock (fallback)
│   ├── posts.ts
│   ├── messages.ts
│   ├── profile.ts
│   └── profilePosts.ts
├── types/                     # Tipos TypeScript
│   ├── post.ts
│   ├── message.ts
│   └── profile.ts
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Componentes

### Layout Components
- **DesktopLayout**: Layout principal para desktop (3 colunas)
- **MobileLayout**: Layout principal para mobile (coluna única)
- **LeftSidebar**: Sidebar esquerda com navegação
- **MainContent**: Área central com posts
- **RightSidebar**: Sidebar direita com mensagens
- **TopBar**: Barra superior para mobile
- **NavigationTabs**: Abas de navegação reutilizáveis
- **BottomNavigation**: Navegação inferior para mobile

### Post Components
- **PostsFeed**: Feed de posts com variantes desktop/mobile e dados reais
- **PostCard**: Card individual de post reutilizável

### Message Components
- **MessageList**: Lista de mensagens com dados reais

### Profile Components
- **DesktopProfileLayout**: Layout desktop para página de perfil
- **MobileProfileLayout**: Layout mobile para página de perfil
- **ProfileHeader**: Cabeçalho com botões de ação
- **ProfileBanner**: Banner com imagens de fundo e foto de perfil
- **ProfileInfo**: Informações e estatísticas do perfil
- **ProfileTabs**: Abas Principal/Fotos
- **ProfilePostCard**: Card de post específico para perfil

### API Functions
- **posts.ts**: Funções para buscar posts do banco de dados
- **users.ts**: Funções para buscar dados de usuários
- **messages.ts**: Funções para buscar mensagens

### Data & Types
- **posts.ts**: Dados mock dos posts (fallback)
- **messages.ts**: Dados mock das mensagens (fallback)
- **profile.ts**: Dados mock do perfil (fallback)
- **profilePosts.ts**: Posts mock do perfil (fallback)
- **post.ts**: Tipos TypeScript para posts
- **message.ts**: Tipos TypeScript para mensagens
- **profile.ts**: Tipos TypeScript para perfil

## Páginas

### Página Inicial (`/`)
- Feed principal da rede social
- Layout responsivo desktop/mobile
- Posts vindos do banco de dados
- Mensagens em tempo real

### Página de Perfil (`/profile/[username]`)
- Perfil dinâmico de qualquer usuário
- Dados reais do banco de dados
- Posts específicos do usuário
- Estatísticas atualizadas
- Layout responsivo desktop/mobile

## Banco de Dados

### MongoDB com Prisma
- **Posts**: Conteúdo, imagens, vídeos, likes, comentários
- **Users**: Perfis, detalhes pessoais, estatísticas
- **Messages**: Sistema de mensagens privadas
- **Follows**: Sistema de seguidores
- **Comments**: Sistema de comentários
- **Likes**: Sistema de curtidas
- **Notifications**: Sistema de notificações

### Principais Tabelas
- `User`: Usuários e perfis
- `Post`: Posts e conteúdo
- `Message`: Mensagens privadas
- `Follow`: Relacionamentos de seguidores
- `Comment`: Comentários nos posts
- `Like`: Curtidas nos posts
- `Notification`: Notificações do sistema

## APIs Implementadas

### Posts
- `GET /api/posts` - Listar posts
- `POST /api/posts/create` - Criar post
- `GET /api/posts/[id]` - Buscar post específico
- `PUT /api/posts/[id]/approve` - Aprovar post

### Users
- `GET /api/users/[identifier]` - Buscar usuário
- `PUT /api/users/edit-profile` - Editar perfil
- `GET /api/users/suggestions` - Sugestões de usuários
- `GET /api/users/stats` - Estatísticas

### Messages
- `GET /api/messages` - Listar mensagens
- `POST /api/messages` - Enviar mensagem

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/logout` - Logout

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
# .env.local
DATABASE_URL="mongodb://localhost:27017/d4swing"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

4. Execute as migrações do banco:
```bash
npx prisma generate
npx prisma db push
```

## Execução

Para executar em modo de desenvolvimento:
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

### Navegação
- **Página Inicial**: `http://localhost:3000`
- **Página de Perfil**: `http://localhost:3000/profile/[username]`

## Scripts Disponíveis

- `npm run dev` - Executa em modo de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run start` - Executa build de produção
- `npm run lint` - Executa linter
- `npx prisma studio` - Abre interface do Prisma Studio
- `npx prisma generate` - Gera cliente Prisma
- `npx prisma db push` - Sincroniza schema com banco

## Tecnologias Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Banco de Dados**: MongoDB
- **Autenticação**: NextAuth.js
- **Ícones**: Lucide React
- **WebSocket**: Socket.io (para notificações em tempo real)

## Benefícios da Arquitetura

- **Reutilização**: Componentes podem ser reutilizados em diferentes partes da aplicação
- **Manutenibilidade**: Código organizado e fácil de manter
- **Testabilidade**: Componentes isolados são mais fáceis de testar
- **Escalabilidade**: Fácil adicionar novos componentes e funcionalidades
- **Responsividade**: Componentes adaptáveis para diferentes tamanhos de tela
- **Dados Reais**: Integração completa com banco de dados MongoDB
- **Performance**: Otimizações com Prisma e Next.js
- **Segurança**: Autenticação e autorização implementadas 