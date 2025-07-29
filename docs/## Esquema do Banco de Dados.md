## Esquema do Banco de Dados

Abaixo está o diagrama das entidades e seus relacionamentos utilizados neste projeto:

![Esquema do Banco de Dados](docs/esquema-do-banco.png)

- **Product** referencia **Category**
- **Order** referencia **Customer**
- **Order** possui vários itens, cada um referenciando um **Product**
- **Customer** pode ter vários **Order**
- **Category** pode ter vários **Product**

> O arquivo da imagem deve estar em: `docs/esquema-do-banco.png`
