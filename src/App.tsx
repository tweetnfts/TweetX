import logo from "./logo.svg";
import { oraPromise } from "ora";
import { wagmiContract } from "./contract";
import "./App.css";
import { Buffer } from "buffer";
import { create } from "ipfs-http-client";
import { needle } from "needle";
import { privateKeyToAccount } from "viem/accounts";
import React, { useEffect, useState } from "react";
import { emojisplosion, emojisplosions } from "emojisplosion";
import { ChatGPTAPI } from "chatgpt";
import ReactDOM from "react-dom";
import {
	Address,
	Hash,
	TransactionReceipt,
	createPublicClient,
	createWalletClient,
	custom,
	http,
	parseEther,
	stringify,
} from "viem";
import { goerli } from "viem/chains";
import "viem/window";

const client = create({
	host: "ipfs.infura.io",
	port: 5001,
	protocol: "https",
	headers: {
		authorization:
			"Basic " +
			Buffer.from(
				`${process.env.REACT_APP_INFURA_PUBLIC_KEY}:${process.env.REACT_APP_INFURA_SECRET_KEY}`
			).toString("base64"),
	},
});

async function downloadImage(url, name) {
	const link = document.createElement("a");
	link.href = url;
	link.download = name;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

const publicClient = createPublicClient({
	chain: goerli,
	transport: http(),
});

const walletClient = createWalletClient({
	chain: goerli,
	transport: custom(window.ethereum!),
});

const token = process.env.REACT_APP_BEARER_TOKEN;

const Tweet = ({ data }) => {
	// Fill out this component using the structure of a tweet
	return (
		<div>
			<h1>{data.text}</h1>
			{/* Fill out the rest of the tweet details */}
		</div>
	);
};

function App() {
	const [account, setAccount] = useState<Address>();
	const [hash, setHash] = useState<Hash>();
	const [receipt, setReceipt] = useState<TransactionReceipt>();
	const [tweetID, setTweetID] = useState(0);

	const idInput = React.createRef<HTMLInputElement>();

	const connect = async () => {
		const [address] = await walletClient.requestAddresses();
		setAccount(address);
	};
	console.log(token);

	const private_key = process.env.REACT_APP_PRIVATE_KEY;

	const mint = async () => {
		if (!account) return;

		const tweetID = idInput.current!.value as `${number}`;
		const data = await publicClient.readContract({
			...wagmiContract,
			account: privateKeyToAccount(private_key),
			functionName: "balanceOf",
			args: [account, tweetID],
		});

		emojisplosion({
			position: {
				x: 950,
				y: 500,
			},
		});

		const response = await fetch(
			`https://cors-anywhere.herokuapp.com/https://api.twitter.com/2/tweets/${tweetID}?expansions=attachments.media_keys,author_id&tweet.fields=public_metrics,created_at,entities,geo,possibly_sensitive,source,withheld&media.fields=public_metrics,height,width,url&user.fields=created_at,description,public_metrics`,
			{
				method: "GET",
				mode: "cors",
				headers: {
					Authorization: `Bearer ${token}`,
					"Access-Control-Allow-Methods": "GET",
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Headers": "Content-Type",
				},
			}
		)
			.then((response) => response.json())
			.catch((error) => console.error(error));

		console.log(response);
		console.log(
			`https://twitter.com/${response.includes.users[0].username}/status/${tweetID}`
		);

		const twitterImage = await fetch(
			"https://cors-anywhere.herokuapp.com/https://tweetpik.com/api/v2/images",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					authorization: `${process.env.REACT_APP_TWEET_PIC_KEY}`,
				},
				body: JSON.stringify({
					url: `https://twitter.com/${response.includes.users[0].username}/status/${tweetID}`,
				}),
			}
		).then((response) => response.json());

		console.log(response.data.text);

		const prompt = `Summarize the following text in three words: "${response.data.text}". It has to ONLY be three words, NOT more. There CANNOT be any dots, commas, or other special characters. Only three words. NO DOTS. NO COMMAS. THE TEXT'S SUMMARY SHOULD ONLY CONTAIN THREE WORDS.`;

		const ChatGPTResponse = await fetch(
			"https://cors-anywhere.herokuapp.com/https://api.openai.com/v1/engines/text-davinci-002/completions",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.REACT_APP_OPENAI_KEY}`,
				},
				body: JSON.stringify({
					prompt: prompt,
					max_tokens: 60,
				}),
			}
		).then((response) => response.json());

		const toTitleCase = (phrase) => {
			return phrase
				.toLowerCase()
				.split(" ")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
		};

		console.log(ChatGPTResponse);
		const nftName = toTitleCase(
			ChatGPTResponse.choices[0].text
				.replace(/\n\n/g, "")
				.split(".")
				.join("")
				.split(",")
				.join("")
				.split("@")
				.join("")
				.split("#")
				.join("")
		);

		console.log(`{ "description": "${response.data.text.replace(
			/\n\n/g,
			" "
		)}", "external_url": "https://twitter.com/${
			response.includes.users[0].username
		}/status/${tweetID}", "image": "${
			twitterImage.url
		}", "name": "${nftName}", "attributes": [
    {
      "trait_type": "Author", 
      "value": "${response.includes.users[0].name} (@${
			response.includes.users[0].username
		})"
    },
		{
			"display_type": "date",
      "trait_type": "Creation Date",
			"value": ${Math.floor(new Date(response.data.created_at).getTime() / 1000)}
		},
    {
      "trait_type": "Likes", 
      "value": ${response.data.public_metrics.like_count}
    },
    {
      "trait_type": "Bookmarks", 
      "value": ${response.data.public_metrics.bookmark_count}
    },
    {
      "trait_type": "Impressions", 
      "value": ${response.data.public_metrics.impression_count}
    },
    {
      "trait_type": "Quote Retweets", 
      "value": ${response.data.public_metrics.quote_count}
    },
    {
      "trait_type": "Retweets", 
      "value": ${response.data.public_metrics.retweet_count}
    },
    {
      "trait_type": "Comments", 
      "value": ${response.data.public_metrics.reply_count}
    }
  ]}`);

		const result =
			await client.add(`{ "description": "${response.data.text.replace(
				/\n\n/g,
				" "
			)}", "external_url": "https://twitter.com/${
				response.includes.users[0].username
			}/status/${tweetID}", "image": "${
				twitterImage.url
			}", "name": "${nftName}", "attributes": [
    {
      "trait_type": "Author", 
      "value": "${response.includes.users[0].name} (@${
				response.includes.users[0].username
			})"
    },
		{
			"display_type": "date",
      "trait_type": "Creation Date",
			"value": "${Math.floor(new Date(response.data.created_at).getTime() / 1000)}"
		},
    {
      "trait_type": "Likes", 
      "value": ${response.data.public_metrics.like_count}
    },
    {
      "trait_type": "Bookmarks", 
      "value": ${response.data.public_metrics.bookmark_count}
    },
    {
      "trait_type": "Impressions", 
      "value": ${response.data.public_metrics.impression_count}
    },
    {
      "trait_type": "Quote Retweets", 
      "value": ${response.data.public_metrics.quote_count}
    },
    {
      "trait_type": "Retweets", 
      "value": ${response.data.public_metrics.retweet_count}
    },
    {
      "trait_type": "Comments", 
      "value": ${response.data.public_metrics.reply_count}
    }
  ]}`);
		console.log(result);
		const ipfsHash = result.path;

		if (data == 0) {
			const { request } = await publicClient.simulateContract({
				...wagmiContract,
				functionName: "mint",
				args: [account, tweetID, 1, `https://ipfs.io/ipfs/${ipfsHash}`, "0x0"],
				account: privateKeyToAccount(private_key),
			});
			const hash = await walletClient.writeContract(request);
			setHash(hash);
		} else {
			const { request } = await publicClient.simulateContract({
				...wagmiContract,
				functionName: "updateURI",
				args: [`https://ipfs.io/ipfs/${ipfsHash}`, tweetID],
				account: privateKeyToAccount(private_key),
			});
			const hash = await walletClient.writeContract(request);
			setHash(hash);
		}
		setTweetID(tweetID);
	};

	useEffect(() => {
		(async () => {
			if (hash) {
				console.log(`hash: ${hash}`);
				const receipt = await publicClient.waitForTransactionReceipt({ hash });
				setReceipt(receipt);
			}
		})();
	}, [hash]);
	const return_statement = `<p>Transaction validated! ✅ Head over to <a href="https://testnets.opensea.io/assets/goerli/0xEfE9eE7261b264c49b2d6aC434B3bf01546Ca0E0/${tweetID}"> OpenSea to check it</a> out.</p>`;

	function shortenString(input) {
		return input.slice(0, 6) + "..." + input.slice(-3);
	}

	if (account)
		return (
			<>
				<div className="center-screen">
					<div className="connected">
						<strong>Connected:</strong> {shortenString(account)}
					</div>
					<div className="submit">
						<input className="inputtext" ref={idInput} placeholder="Tweet ID" />
						<button id="fancy-button" className="button-84" onClick={mint}>
							<strong>Mint/Update</strong>
						</button>
					</div>
					{receipt && (
						<div>
							<div
								className="content"
								dangerouslySetInnerHTML={{ __html: return_statement }}
							></div>
							{/* Receipt:{" "} */}
							{/* <pre> */}
							{/* 	<code>{stringify(receipt, null, 2)}</code> */}
							{/* </pre> */}
						</div>
					)}
				</div>
			</>
		);
	return (
		<div className="center-screen-button">
			<button className="button-85" onClick={connect}>
				<strong>Connect Wallet</strong>
			</button>
		</div>
	);
}

export default App;
