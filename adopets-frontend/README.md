--AdoPet
Plataforma web para conectar pets disponíveis para adoção com potenciais adotantes, focada na região de Fortaleza e região metropolitana.

--Sobre o Projeto
O AdoPet é um sistema desenvolvido para facilitar o processo de adoção de animais. Ele permite que usuários busquem pets, agendem visitas, façam doações e que administradores gerenciem todo o fluxo de solicitações.

--Tecnologias Utilizadas
Frontend: React.js, React Router, Bootstrap (estilização).

Backend/Banco de Dados: Firebase (Firestore, Authentication, Storage).


--Funcionalidades

Usuário:

Cadastro e login com autenticação Firebase.

Filtros inteligentes para busca de pets (tipo, idade, porte, status).

Sistema de solicitações de adoção e agendamento de visitas.

Área do usuário para acompanhar status (Adotado, Reservado, Pendente).

Administrador:

Dashboard com métricas de adoção.

Gerenciamento completo de pets (CRUD: Criar, Ler, Atualizar, Deletar).

Gerenciamento de solicitações de adoção e agendamentos.

--Como rodar o projeto localmente
Clone o repositório:

Bash
git clone https://github.com/ArturReyals/AdoPets
cd adopet
Instale as dependências:

Bash
npm install
Configure o Firebase:

Crie um arquivo .env na raiz e adicione suas credenciais do Firebase:

Snippet de código
REACT_APP_FIREBASE_API_KEY=sua-chave
REACT_APP_FIREBASE_AUTH_DOMAIN=seu-dominio
# ... adicione as outras variáveis
Inicie o projeto:

Bash
npm npm run dev

