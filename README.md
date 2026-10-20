App na Esquina 🏪

Plataforma completa de e-commerce e gestão de entregas para mercadinhos de bairro. O sistema permite que clientes encontrem produtos em estabelecimentos próximos, comparem preços e distâncias, realizem pedidos e acompanhem o status em tempo real. Para os comerciantes, oferece um painel de gestão de catálogo e controle de pedidos.

🛠️ Tecnologias Utilizadas

Back-end (API REST)

Linguagem & Framework: Java 21 / Spring Boot 3.4+

Segurança: Spring Security com autenticação Stateless via JSON Web Tokens (JWT)

Persistência de Dados: Spring Data JPA / Hibernate

Banco de Dados: MySQL

Documentação: Springdoc OpenAPI 3.1 (Swagger UI)

Utilitários: Lombok, Maven

Front-end (Mobile / Web)

Framework: React Native (Expo)

Navegação: React Navigation (Stack / Tabs)

Comunicação HTTP: Axios

Gerenciamento de Estado: React Context API (AuthContext)

📋 Funcionalidades Principais

Perfil Cliente

Busca Global de Produtos: Pesquisa de itens em múltiplos mercadinhos simultaneamente, com ordenação por menor preço ou menor distância ($Km$).

Carrinho de Compras: Adição de itens e envio direto do pedido para o estabelecimento.

Acompanhamento de Pedidos: Tela com atualização periódica em tempo real (polling a cada 5 segundos) e confirmação de recebimento.

Perfil Comerciante

Dashboard do Estabelecimento: Resumo financeiro, contagem de pedidos e navegação rápida.

Gestão do Catálogo: Cadastro, edição, alteração de destaque e remoção de produtos com atualização em banco.

Painel de Pedidos: Recepção e avanço de etapas de pedidos (PENDENTE ➔ EM_PREPARO ➔ SAIU_PARA_ENTREGA ➔ CONCLUIDO / CANCELADO).

🚀 Como Executar o Projeto

Pré-requisitos

Java 21 ou superior instalado

MySQL Server rodando

Node.js (v18+) e npm/yarn instalados

Expo Go instalado no smartphone (opcional para testes mobile)

1. Configurando e Executando o Back-end

Clone o repositório e acesse a pasta do back-end:

cd app_na_esquina


Configure o acesso ao MySQL no arquivo src/main/resources/application.properties:

spring.datasource.url=jdbc:mysql://localhost:3306/app_na_esquina?createDatabaseIfNotExist=true&useSSL=false
spring.datasource.username=SEU_USUARIO
spring.datasource.password=SUA_SENHA
spring.jpa.hibernate.ddl-auto=update


Execute a aplicação Spring Boot:

mvnw spring-boot:run


Aceda à documentação da API (Swagger UI):
👉 http://localhost:8080/swagger-ui/index.html

2. Configurando e Executando o Front-end

Acesse a pasta do projeto React Native:

cd app_na_esquina_frontend


Instale as dependências:

npm install


Certifique-se de que a URL base da API no arquivo src/services/api.js aponta para o endereço IP da sua máquina:

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.X.X:8080', // Substitua pelo IP da sua máquina
});

export default api;


Inicie o servidor do Expo:

npx expo start


📌 Principais Endpoints da API

Método

Endpoint

Descrição

Requer Auth

POST

/api/auth/login

Autenticação e geração do Token JWT

❌

POST

/api/usuarios

Cadastro de novos clientes / comerciantes

❌

GET

/api/produtos/buscar

Busca global com ordenação de preço/distância

❌

GET

/api/produtos/mercadinho/{id}

Lista produtos de um mercadinho específico

✅

POST

/api/produtos

Cadastro de novo produto no catálogo

✅

PUT

/api/produtos/{id}

Atualização dos dados do produto

✅

DELETE

/api/produtos/{id}

Exclusão de produto do catálogo

✅

POST

/api/pedidos

Criação e finalização de pedido

✅

GET

/api/pedidos/cliente/{id}

Lista pedidos realizados pelo cliente

✅

GET

/api/pedidos/mercadinho/{id}

Lista pedidos recebidos pelo mercadinho

✅

PUT

/api/pedidos/{id}/status

Alteração do status do pedido

✅

📄 Licença

Este projeto foi desenvolvido como Trabalho de Conclusão de Curso (TCC) no SENAI. Todos os direitos reservados.