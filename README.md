# CPS510 - Toronto KittyCab
## Stack
Front-end: JavaScript, CSS
Back-end: Express, Node.js
DB: Oracle SQL

## Prerequisites
Have npm and node installed.

Install https://www.oracle.com/database/technologies/instant-client/winx64-64-downloads.html and extract the folder.

## Steps to Running Locally
1. Clone this repo
2. cd ./server and drag the extracted oracle
3. Create a .env in ./server with the format below
>DB_USER=XXXX
>DB_PASSWORD=XXXX
>DB_CONNECTION_STRING=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=oracle.scs.ryerson.ca)(PORT=1521))(CONNECT_DATA=(SID=orcl)))
4. Run server
>node backend.js
5. cd ../client and run index.html

## Application Usage
Login credentials
Username: admin
Password: admin
