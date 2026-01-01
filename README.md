# MS-Payment

Serviço integrado com Mercado Pago para criação de Pagamentos dos pedidos gerados no sistema

### Estrutura

<img width="769" height="527" alt="image" src="https://github.com/user-attachments/assets/ea918960-ddd7-4320-bfd8-597451d4e277" />

### Serviços oferecidos/consumidos

<img width="704" height="469" alt="image" src="https://github.com/user-attachments/assets/7dbc9444-b797-4133-82a0-c7ba2d6eead9" />

### Estrutura de arquivos

```
.
├── scripts # Scripts de ajuda para criar secrets na AWS e publicar mensagem no SQS
├── serverless.yml # Definição da infraestrutura do projeto utilizando Serverless Framework
├── docker-compose.yml # Configuração de contâineres para rodar o projeto local
└── src
    ├── adapters/
        ├── driven # Serviços consumidos (Ex: DynamoDB, SQS, SNS)
        └── driver # Serviços oferecidos (Ex: API HTTP usando Lambda + API Gateway)
    ├── core/
        ├── application/usecases # Regras de negócio
        └── domain
            ├── entities # Entidades do serviço
            └── ports # Definição de contratos para consumo/oferecimento de serviços
    ├── infra/
        ├── aws # Wrappers de clientes da AWS para consumo posterior
        └── di # Classes de preparação do usecase para execução
    └── utils
```

### Pré-requisitos

* Node 20
* Docker
* AWS Cli

### Rodando local

Para rodar localmente siga o passo-a-passo abaixo:

#### 1. Instalando dependências

```bash
npm install
```

#### 2. Subindo contâineres Docker

Serão criados os contâineres do Localstack para simulação do ambiente AWS localmente e um para melhor visualização das tabelas e itens do DynamoDB

```bash
docker compose up -d
```

#### 3. Configurar credenciais AWS

Procure em sua máquina onde fica armazenado o arquivo de credentials da AWS (No Linux geralmente fica em ~/.aws/credentials)

Garanta que haja um registro assim no seu arquivo:
```bash
[default]
aws_access_key_id = key
aws_secret_access_key = secret
```

#### 4. Criar secrets do Mercado Pago

Para isso serão necessários algumas informações da sua conta Mercado Pago:

* clientId
* clientSecret
* userId
* posId (Esse POS deve ser criado utilizando as API's do Mercado pago, sendo apenas o ID necessário)

```bash
./scripts/local/setup_sm.sh
```

#### 5. Deploy

Ao finalizar o deploy irá ser mostrado no console os endpoint criados que pode ser copiado para um Postman ou Insomnia para testes

```bash
npx sls deploy --stage local
```

Obs: se for preciso alterar algo no projeto, é necessário remover o serviço do localstack e deployar novamente. Para remover use:
```bash
npx sls remove --stage local
```
