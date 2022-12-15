## Luc's NC-Games API

## Hosted version of this API


## Project Summary



## Setup instructions

Start by cloning this repo - instructions here - https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository

After opening the repo in your terminal, start by running 'npm install' or follow the links below for the required packages



## .env file setup

You will need to create 2 .env files to test and use this api, both should live in the root directory of this repo

.env.test should be populated with PGDATABASE=nc_games_test
.env.development should be populated with PGDATABASE=nc_games

## Requirements

In order to run and experiment with this repo you will need the following software:

- node v19.1.0 - https://nodejs.org/download/release/v19.2.0/
- postgres v14.5 - https://www.postgresql.org/ftp/source/v14.5/

Alongside the following packages (links for manual installation, or run 'npm install' as above)

- dotenv v16.0.0 - https://www.npmjs.com/package/dotenv/v/16.0.0
- pg v8.7.3 - https://www.npmjs.com/package/pg/v/8.7.3
- pg-format v1.0.4 - https://www.npmjs.com/package/pg-format/v/1.0.4
- express v4.18.2 - https://www.npmjs.com/package/express/v/4.18.2