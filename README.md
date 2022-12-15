## Luc's NC-Games API

## Hosted version of this API

https://lc-portfolio-nc-games.onrender.com/api/

## Project Summary

This API was one of my end of module projects for Northcoders, which demonstrates my ability to utilise PSQL and Javascript to host a queriable database web service. 

Navigate to the endpoint /api to get a list of all currently functioning endpoints, all of which have been extensively tested using Jest and internal code reviews.

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