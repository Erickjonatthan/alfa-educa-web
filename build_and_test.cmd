@echo off
REM Builda tudo e executa o teste no Docker

docker-compose build
if %errorlevel% neq 0 (
    echo Erro ao buildar containers.
    exit /b 1
)

docker-compose up -d site
if %errorlevel% neq 0 (
    echo Erro ao subir o site.
    exit /b 1
)

docker-compose run --rm test
if %errorlevel% neq 0 (
    echo Teste Selenium falhou. Removendo containers...
    docker-compose down -v --rmi all --remove-orphans
    exit /b 1
)

echo Teste passou! O container do frontend continua rodando.
REM Remove explicitamente qualquer container parado do serviço de teste usando label exclusiva
for /f "tokens=*" %%i in ('docker ps -a -q -f "status=exited" -f "label=alfa-educa-teste=true"') do docker rm -f %%i

exit /b 0
