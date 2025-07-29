@echo off
echo Iniciando MongoDB...

REM Garante que a pasta de dados existe
if not exist "C:\data\db" (
    mkdir "C:\data\db"
)

REM Verifica se já existe um mongod rodando
tasklist | findstr mongod.exe > nul
if %errorlevel%==0 (
    echo O MongoDB já está rodando.
    exit /b
)

cd "C:\Program Files\MongoDB\Server\8.0\bin"
mongod.exe --dbpath "C:\data\db"