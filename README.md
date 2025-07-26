# AlfaEduca Web

![AlfaEduca Logo](public/imagem/logo-alfa-educa.jpg)

## 📖 Sobre o Projeto

AlfaEduca é uma plataforma web educacional focada em alfabetização e aprendizado interativo. O projeto foi desenvolvido como uma aplicação estática usando HTML, CSS e JavaScript, containerizada com Docker para facilitar a implantação e distribuição.

## 🐳 Configuração Docker

### Responsáveis pela Configuração Docker
- **Erick Santos** - Configuração inicial do Dockerfile e NGINX

### Arquitetura do Container

O projeto utiliza uma arquitetura simples baseada em:
- **Servidor Web**: NGINX Alpine Linux
- **Aplicação**: Frontend estático (HTML/CSS/JS)
- **Porta**: 8082 (host) → 80 (container)

### Componentes Docker

#### 1. Dockerfile
```dockerfile
FROM nginx:alpine

# Copia os arquivos estáticos para o NGINX
COPY ./public /usr/share/nginx/html

# Configuração customizada do NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Explicação dos Componentes:**
- **Base Image**: `nginx:alpine` - Imagem otimizada e leve do NGINX
- **COPY ./public**: Copia todos os arquivos da aplicação web para o diretório padrão do NGINX
- **nginx.conf**: Configuração customizada do servidor
- **EXPOSE 80**: Expõe a porta 80 do container
- **CMD**: Inicia o NGINX em modo foreground

#### 1.1 Dockerfile.selenium
```dockerfile
FROM python:3.11-slim

# Instala dependências do sistema
RUN apt-get update && \
    apt-get install -y wget unzip curl gnupg2 && \
    apt-get install -y chromium-driver chromium && \
    rm -rf /var/lib/apt/lists/*

# Instala dependências Python
COPY requirements.txt /app/requirements.txt
WORKDIR /app
RUN pip install --no-cache-dir -r requirements.txt

# Copia o script de teste
COPY test_selenium.py /app/test_selenium.py

# Executa o teste
CMD ["python", "test_selenium.py"]
```

**Explicação dos Componentes:**
- **Base Image**: `python:3.11-slim` - Imagem Python otimizada
- **Sistema**: Instalação do Chrome e ChromeDriver para Selenium
- **Dependências**: Instalação das bibliotecas Python necessárias
- **Script**: Copia e executa o script de teste automatizado

#### 2. Docker Compose (docker-compose.yml)
```yaml
services:
  site:
    container_name: alfa-educa-web
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8082:80"
    restart: always
  test:
    build:
      context: .
      dockerfile: Dockerfile.selenium
    network_mode: "host"
    depends_on:
      - site
    entrypoint: ["python", "test_selenium.py"]
    labels:
      - alfa-educa-teste=true
```

**Configurações Detalhadas:**
- **Serviço site**:
  - **container_name**: Nome específico para fácil identificação
  - **build context**: Diretório atual como contexto de build
  - **ports**: Mapeamento da porta 8082 (host) para 80 (container)
  - **restart**: Política de reinicialização automática

- **Serviço test**:
  - **Dockerfile.selenium**: Imagem específica para testes
  - **network_mode**: "host" para acessar o site localmente
  - **depends_on**: Garante que o site esteja rodando antes dos testes
  - **entrypoint**: Executa o script de teste Python
  - **labels**: Identifica containers de teste para limpeza

#### 3. Configuração NGINX (nginx.conf)
```nginx
server {
    listen 80;
    server_name site-alfaeduca.ejms-api.shop;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

**Características:**
- **listen 80**: Escuta na porta padrão HTTP
- **server_name**: Domínio configurado para produção
- **root**: Diretório raiz dos arquivos estáticos
- **try_files**: Fallback para arquivos não encontrados

## 🚀 Instalação e Execução

### Pré-requisitos
- Docker Desktop instalado
- Docker Compose instalado
- Git (para clonar o repositório)

### Passo a Passo

1. **Clone o repositório:**
```bash
git clone [URL_DO_REPOSITORIO]
cd alfa-educa-web
```

2. **Configure as variáveis de ambiente:**
```bash
copy .env.example .env
```
Edite o arquivo `.env` com as configurações da sua API:
```env
API_URL=http://localhost:8081/
```

3. **Build e execução do projeto:**

No Windows:
```bash
build_and_test.cmd
```

No Linux/Mac:
```bash
chmod +x build_and_test.sh
./build_and_test.sh
```

Este script irá:
- Buildar os containers
- Subir o serviço do site
- Executar os testes Selenium
- Manter o frontend rodando se os testes passarem
- Limpar containers de teste

4. **Acessar a aplicação:**
```
http://localhost:8082
```

### Scripts de Build e Teste

O projeto possui dois scripts para build e teste automatizado:

#### Windows (`build_and_test.cmd`)
```bat
# Executa build, testes e mantém o site rodando
build_and_test.cmd
```

#### Linux/Mac (`build_and_test.sh`)
```bash
# Dar permissão de execução
chmod +x build_and_test.sh

# Executa build, testes e mantém o site rodando
./build_and_test.sh
```

### Comandos Úteis

```bash
# Parar os containers e remover tudo
docker-compose down -v --rmi all --remove-orphans

# Ver logs
docker-compose logs -f

# Acessar o container
docker exec -it alfa-educa-web sh

# Listar containers de teste parados
docker ps -a -f "status=exited" -f "label=alfa-educa-teste=true"
```

## 📂 Estrutura do Projeto

```
alfa-educa-web/
├── docker-compose.yml      # Orquestração dos containers
├── Dockerfile             # Definição da imagem Docker do site
├── Dockerfile.selenium    # Definição da imagem Docker para testes
├── nginx.conf             # Configuração do servidor NGINX
├── build_and_test.cmd    # Script de build e teste para Windows
├── build_and_test.sh     # Script de build e teste para Linux/Mac
├── test_selenium.py      # Testes automatizados com Selenium
├── requirements.txt      # Dependências Python para os testes
├── .env.example           # Modelo de variáveis de ambiente
├── .env                   # Variáveis de ambiente (não versionado)
├── .gitignore             # Arquivos ignorados pelo Git
├── ENV_README.md          # Documentação das variáveis de ambiente
├── public/                # Arquivos da aplicação web
│   ├── index.html         # Página principal
│   ├── login.html         # Sistema de login
│   ├── pagina-inicial.html # Dashboard principal
│   ├── atividade.html     # Página de atividades
│   ├── conquistas.html    # Sistema de gamificação
│   ├── usuario.html       # Perfil do usuário
│   ├── css/              # Estilos CSS
│   ├── js/               # Scripts JavaScript
│   │   ├── const.js      # Constantes da aplicação
│   │   ├── config.js     # Configurações do ambiente
│   │   ├── env-loader.js # Carregador de variáveis de ambiente
│   │   └── ...           # Outros scripts
│   └── imagem/           # Assets e imagens
```

## 🎥 Vídeo de Instalação

**🔗 Link do Vídeo no YouTube:** [INSERIR_LINK_AQUI]

O vídeo demonstra:
1. Instalação do Docker Desktop do zero
2. Clone do repositório
3. Build da imagem Docker
4. Execução do container
5. Teste da aplicação funcionando
6. Comandos de gerenciamento

## 🔧 Funcionalidades da Aplicação

- **Sistema de Login/Registro**
- **Dashboard Interativo**
- **Atividades Educacionais**
- **Sistema de Conquistas/Gamificação**
- **Gerenciamento de Perfil**
- **Interface Responsiva**
- **Sistema de Configuração de Ambiente**
- **Integração com API Backend**

## ⚙️ Sistema de Configuração

### Variáveis de Ambiente

O projeto utiliza um sistema inteligente de variáveis de ambiente que:

- **Detecta automaticamente** o ambiente (desenvolvimento/produção)
- **Carrega configurações** específicas para cada ambiente
- **Mantém segurança** não versionando informações sensíveis
- **Facilita deployment** em diferentes ambientes

#### Arquivos de Configuração:

- **`.env.example`**: Modelo com todas as variáveis necessárias
- **`.env`**: Configurações reais do ambiente local (não versionado)
- **`public/js/env-loader.js`**: Carregador inteligente de ambiente
- **`public/js/config.js`**: Configuração centralizada da aplicação
- **`public/js/const.js`**: Constantes exportadas para toda a aplicação

#### Configuração Automática por Ambiente:

```javascript
// Desenvolvimento (localhost)
API_URL: 'http://localhost:8081/'

// Produção (domínio real)
API_URL: 'https://sua-api-producao.com/'
```

Para mais detalhes, consulte o arquivo `ENV_README.md`.

## 🌐 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
- **Servidor Web**: NGINX
- **Containerização**: Docker & Docker Compose
- **Base**: Alpine Linux
- **Configuração**: Sistema de variáveis de ambiente

## 📊 Métricas do Container

- **Tamanho da Imagem**: ~25MB (NGINX Alpine + arquivos estáticos)
- **Tempo de Build**: ~30-60 segundos
- **Uso de Memória**: ~10-15MB em execução
- **Tempo de Inicialização**: ~2-5 segundos

## 🔍 Troubleshooting

### Problemas Comuns

1. **Porta já em uso:**
```bash
# Alterar porta no docker-compose.yml
ports:
  - "8083:80"  # Use outra porta
```

2. **Permission Denied:**
```bash
# No Linux/Mac
sudo docker-compose up --build
```

3. **Build falha:**
```bash
# Limpar cache Docker
docker system prune -a
docker-compose build --no-cache
```

4. **API não conecta:**
```bash
# Verificar configuração no .env
echo API_URL no arquivo .env

# Testar conexão
curl http://localhost:8081/
```

5. **Variáveis de ambiente não carregam:**
```javascript
// Verificar no console do navegador
console.log('API_URL:', API_URL);

// Recarregar configuração
window.location.reload();
```

## 🚀 Deploy em Produção

### Variáveis de Ambiente
```yaml
# docker-compose.prod.yml
services:
  site:
    environment:
      - NGINX_HOST=seu-dominio.com
      - NGINX_PORT=80
```

### Configuração da API

Para produção, o sistema detecta automaticamente o ambiente e utiliza:
```javascript
// Configuração automática baseada no hostname
const isProduction = window.location.hostname !== 'localhost';
```

Edite o arquivo `public/js/env-loader.js` para configurar a URL da API de produção:
```javascript
if (isProduction) {
    return {
        API_URL: 'https://sua-api-producao.com/'
    };
}
```

### SSL/HTTPS
Para produção, configure SSL através de:
- Reverse proxy (Traefik, Nginx Proxy Manager)
- Certificados Let's Encrypt
- CloudFlare SSL

## 📝 Logs e Monitoramento

```bash
# Ver logs em tempo real
docker-compose logs -f site

# Verificar status do container
docker-compose ps

# Monitorar recursos
docker stats alfa-educa-web
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença [MIT/Apache/etc.].

---

## 📋 Checklist para Professor

- ✅ **Zero Configuração**: Scripts automatizados para build e teste
- ✅ **Documentação Completa**: Todas as configurações explicadas
- ✅ **Vídeo Demonstrativo**: Instalação do zero no YouTube
- ✅ **Estrutura Limpa**: Arquivos organizados e comentados
- ✅ **Compatibilidade**: Scripts específicos para Windows e Linux/Mac
- ✅ **Troubleshooting**: Soluções para problemas comuns
- ✅ **Testes Automatizados**: Selenium integrado ao processo de build

### Execução do Projeto:
```bash
# 1. Configurar ambiente
copy .env.example .env  # Windows
# ou
cp .env.example .env    # Linux/Mac

# 2. Executar build e testes
build_and_test.cmd     # Windows
# ou
./build_and_test.sh    # Linux/Mac
```

**Acesso:** http://localhost:8082  
**API Backend:** Configure no arquivo `.env`

---

**Projeto Alfa Educa** - Sistema de Educação e Alfabetização  
**Universidade**: UFRPE - UABJ 
**Disciplina**: Projeto Interdisciplinar 4
**Semestre**: 2025.1

## 🧪 Testes Automatizados

O projeto utiliza Selenium para testes automatizados de interface, garantindo que todas as funcionalidades principais estejam funcionando corretamente.

### Componentes de Teste

- **test_selenium.py**: Script Python com os casos de teste
- **requirements.txt**: Dependências Python necessárias
- **Dockerfile.selenium**: Container específico para execução dos testes
- **Scripts de Build**: Integração dos testes no processo de build

### Execução dos Testes

Os testes são executados automaticamente durante o build:
- Verificam se o site está acessível
- Testam funcionalidades principais
- Validam a interface do usuário
- Garantem integração com o backend

### Dependências de Teste

```txt
selenium
# Outras dependências em requirements.txt
```
