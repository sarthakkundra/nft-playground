require("dotenv").config();
const pinataSDK = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

const pinata = new pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);

async function storeImages(imagesFilePath) {
	const fullImagesPath = path.resolve(imagesFilePath);
	const files = fs.readdirSync(fullImagesPath);
	console.log("------------------------------");
	let responses = [];

	for (fileIdx in files) {
		const readableStreamForFile = fs.createReadStream(
			`${fullImagesPath}/${files[fileIdx]}`
		);
		try {
			const options = {
				pinataMetadata: {
					name: files[fileIdx],
				},
			};
			const response = await pinata.pinFileToIPFS(
				readableStreamForFile,
				options
			);
			responses.push(response);
		} catch (error) {
			console.error(error);
		}
	}
	console.log(responses);
	return { responses, files };
}

async function storeTokenUriMetadata(metadata) {
	const options = {
		pinataMetadata: {
			name: metadata.name,
		},
	};

	console.log(metadata);
	try {
		const response = await pinata.pinJSONToIPFS(metadata, options);
		return response;
	} catch (error) {
		consolelog("HEREEEEEEEEE");
		console.log(error);
	}
	return null;
}

module.exports = { storeImages, storeTokenUriMetadata };
