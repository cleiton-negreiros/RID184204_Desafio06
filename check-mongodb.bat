@echo off
echo Verificando se MongoDB está rodando...

netstat -ano | findstr :27017 > nul
if %errorlevel% == 0 (
    echo MongoDB já está rodando na porta 27017
    goto :start_app
)

echo Iniciando MongoDB...

REM Verificar se o diretório de dados existe
if not exist "C:\data\db" (
    echo Criando diretório de dados...
    mkdir "C:\data\db" 2>nul
)

echo Iniciando MongoDB em background...
start /min cmd /c "\"C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe\" --dbpath \"C:\data\db\""

echo Aguardando MongoDB inicializar...
timeout /t 10 > nul

REM Verificar múltiplas vezes se iniciou
for /L %%i in (1,1,5) do (
    netstat -ano | findstr :27017 > nul
    if %errorlevel% == 0 (
        echo MongoDB iniciado com sucesso!
        goto :start_app
    )
    echo Tentativa %%i/5 - Aguardando mais 2 segundos...
    timeout /t 2 > nul
)

echo Erro ao iniciar MongoDB. Tentando diagnóstico...
echo Verificando se o processo mongod está rodando...
tasklist | findstr mongod
if %errorlevel% == 0 (
    echo Processo mongod encontrado, mas porta 27017 não está disponível.
) else (
    echo Processo mongod não encontrado.
)

echo.
echo Tente executar manualmente como Administrador:
echo cd "C:\Program Files\MongoDB\Server\8.0\bin"
echo mongod.exe --dbpath "C:\data\db"
pause
exit /b 1

:start_app
echo.
echo Iniciando aplicação...
npm run dev





