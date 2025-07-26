#!/bin/bash
# Builda tudo e executa o teste no Docker

# Habilita modo de erro estrito
set -e

echo "Iniciando build dos containers..."
docker-compose build
if [ $? -ne 0 ]; then
    echo "Erro ao buildar containers."
    exit 1
fi

echo "Subindo o site..."
docker-compose up -d site
if [ $? -ne 0 ]; then
    echo "Erro ao subir o site."
    exit 1
fi

echo "Executando testes Selenium..."
docker-compose run --rm test
if [ $? -ne 0 ]; then
    echo "Teste Selenium falhou. Removendo containers..."
    docker-compose down -v --rmi all --remove-orphans
    exit 1
fi

echo "Teste passou! O container do frontend continua rodando."

# Remove explicitamente qualquer container parado do serviço de teste usando label exclusiva
STOPPED_CONTAINERS=$(docker ps -a -q -f "status=exited" -f "label=alfa-educa-teste=true")
if [ ! -z "$STOPPED_CONTAINERS" ]; then
    echo "Removendo containers de teste parados..."
    docker rm -f $STOPPED_CONTAINERS
fi

exit 0
