@echo off
echo Iniciando MongoDB...
cd "C:\Program Files\MongoDB\Server\8.0\bin"
mongod.exe --dbpath "C:\data\db"