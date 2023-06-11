import logo from "./logo.svg";
import { oraPromise } from "ora";
import { wagmiContract } from "./contract";
import "./App.css";
import { Buffer } from "buffer";
import { create } from "ipfs-http-client";
import { needle } from "needle";
import { privateKeyToAccount } from "viem/accounts";
import React, { useEffect, useState } from "react";
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
				"2R0Wd1CUP3U2sONZ9KPtsITQzUL:743776d00d42dff9ccca0b92ae0c77af"
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
					authorization: "85105ac2-ceb4-446f-8993-53339a5b55fb",
				},
				body: JSON.stringify({
					url: `https://twitter.com/${response.includes.users[0].username}/status/${tweetID}`,
				}),
			}
		).then((response) => response.json());

		console.log(response.data.text);

		const prompt = `Summarize the following text in three words: "${response.data.text}". It has to ONLY be three words, NOT more. There CANNOT be any dots, commas, or other special characters. Only three words. NO DOTS. NO COMMAS. THE TEXT'S SUMMARY SHOULD ONLY CONTAIN THREE WORDS.`;

		const ChatGPTResponse = await fetch("https://cors-anywhere.herokuapp.com/https://api.openai.com/v1/engines/text-davinci-002/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer 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`,
			},
			body: JSON.stringify({
				prompt: prompt,
				max_tokens: 60,
			}),
		})
			.then((response) => response.json());


		const toTitleCase = (phrase) => {
  return phrase
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

		console.log(ChatGPTResponse);
		const nftName = toTitleCase(ChatGPTResponse.choices[0].text.replace(/\n\n/g, "").split('.').join("").split(',').join(""));
		console.log(nftName);

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

		const { request } = await publicClient.simulateContract({
			...wagmiContract,
			functionName: "mint",
			args: [account, tweetID, 1, `https://ipfs.io/ipfs/${ipfsHash}`, "0x0"],
			account: privateKeyToAccount(private_key),
		});
		const hash = await walletClient.writeContract(request);
		setHash(ipfsHash);
	};

	useEffect(() => {
		(async () => {
			if (hash) {
				const receipt = await publicClient.waitForTransactionReceipt({ hash });
				setReceipt(receipt);
			}
		})();
	}, [hash]);

	if (account)
		return (
			<>
				<div>Connected: {account}</div>
				<input ref={idInput} placeholder="Tweet ID" />
				<button onClick={mint}>Mint</button>
				{receipt && (
					<div>
						Receipt:{" "}
						<pre>
							<code>{stringify(receipt, null, 2)}</code>
						</pre>
					</div>
				)}
			</>
		);
	return <button onClick={connect}>Connect Wallet</button>;
}

export default App;
