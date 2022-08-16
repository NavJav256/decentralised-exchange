# Portfolio Decentralised Exchange

This project demonstrates a fully decentralised exchange powered by hardhat and react.

To run locally you need to install the following:
1. Nodejs
2. npm
3. hardhat
4. Metamask

Step 1:
After downloading the source code, run npm install in the directory of the files

Step 2:
Run hardhat node to start up a local blockchain

Step 3:
Run hardhat run --network localhost ./scripts/1_deploy.js to deploy the contracts

Step 4:
Update config.json to include the addresses the contracts were deployed to in the '31337' key

Step 5:
Run hardhat run --network localhost ./scripts/2_seed-exchange.js to fill the exchange with data

To run on the kovan test network:
Step 1:
Create an account on infura

Step 2:
Create a file called .env and fill with:
INFURA_API_KEY="PUT_YOUR_INFURA_API_KEY_HERE"
PRIVATE_KEYS="ACCOUNT_ADDRESS_TO_DEPLOY_THE_CONTRACTS,SECOND_USER_ACCOUNT_ADDRESS"

Step 3:
Run hardhat run --network kovan ./scripts/1_deploy.js to deploy the contracts

Step 4:
Update config.json to include the addresses the contracts were deployed to in the '42' key

Step 5:
Run hardhat run --network kovan ./scripts/2_seed-exchange.js to fill the exchange with data

To run tests use hardhat test
