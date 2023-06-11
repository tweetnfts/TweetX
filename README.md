<img src="public/tweetX_logo.png"
     alt="TweetX icon"
     style="float: left; margin-right: 10px;" />
# TweetX

Welcome to the decentralized interface for mining tweets as NFTs. Our revolutionary project lets you convert and store any tweet as an NFT simply from its ID, offering a simplified user experience and seamless integration with OpenSea. It's the future of preserving digital cultural moments 🚀.<br>

🐦 Tweet it. Mint it. 🐦


## Overview 

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Install
- Set the `REACT_APP_BEARER_TOKEN` and `REACT_APP_PRIVATE_KEY` environment variables
- Install the dependencies

`yarn install`

### Run 
- Run  to start the development server

`yarn start`
- Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
- Connect your Goerli testnet wallet
- Provide a Tweet ID and click "Mint" button to mint that tweet as an NFT 🚀 !

## How it works 
TweetX is an interface that allows user to mint any tweet into NFTs. When clicked on the "Mint" button, the following steps are executed : 
- Takes a Tweet ID as input
- Fetches the tweet details from the Twitter API v2 JS
- Generates an image of tweet preview using an API
- Sends a prompt to ChatGPT to get a 3 words summary of the tweet
- Store the metadata and image on IPFS
- Mints an NFT on Goerli testnet with:
    - The tweet text as description
    - The tweet preview image
    - The 3 word summary as the NFT name
    - Various tweet metrics as attributes

### Technology used :

- React for the frontend
- Viem for interacting with Ethereum
- OpenZeppelin Contracts for the ERC1155 NFT contract
- IPFS for storing the NFT metadata
- Twitter and tweetpik API for fetching and generating tweet previews
ChatGPT API to summarize the tweet in 3 words


## Structure 
- `./contracts` contains the ERC1155 NFT smart contract
- `./public` contains static assets like favicon, manifest etc.
- `./src` contains the React app code
- `./doc` contains the documentation of the project
- `tsconfig.json` contains TypeScript config
- `package.json` contains project dependencies and scripts
- `.env` contains environment variables

## Roadmap
<img src="doc/roadmap.png"
     alt="TweetX icon"
     style="float: left; margin-right: 10px;" />


## Contribute
TweetX is made for the community.
There are many ways you can participate and support the project.

To improve the application, fork and code your updates. 

Tweet it, mint it, 🍴 fork it 🍴.


Would you like to help keep our smart contract free for a longer period, enabling the community to freely mint their tweets into NFTs? You can contribute by providing financial support in the form of Ethers directly to our ETH adress. Your generosity will enable this innovation to remain accessible to all.

*Coming soon* : governance token are coming soon. Please refer to our Roadmap.

## Licence 
This project is released under the MIT License

