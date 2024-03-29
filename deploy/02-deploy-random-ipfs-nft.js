const { network, ethers } = require("hardhat");
const {
	developmentNetworks,
	networkConfig,
} = require("../helper-hardhat-config");
const {
	storeImages,
	storeTokenUriMetadata,
} = require("../utils/uploadNftToIpfs");
const { Contract } = require("ethers");
const vrfCoordinatorV2ABI = require("@chainlink/contracts/abi/v0.8/VRFCoordinatorV2.json");

const FUND_AMOUNT = "1000000000000000000000";
const IMAGE_PATH = "./public/";

// let tokenUris = [
// 	"ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo",
// 	"ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d",
// 	"ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm",
// ];
let tokenUris = [];

const metadataTemplate = {
	name: "",
	description: "",
	image: "",
	attributes: [
		{
			trait_type: "Cuteness",
			value: 100,
		},
	],
};

module.exports = async ({ deployments, getNamedAccounts }) => {
	const { deployer } = await getNamedAccounts();
	const { deploy, log } = deployments;
	const chainId = network.config.chainId;
	let vrfCoordinatorV2Address, vrfCoordinatorV2, subscriptionId;

	if (process.env.UPLOAD_TO_PINATA == "true") {
		tokenUris = await handleTokenUris();
	}

	if (chainId == 31337) {
		vrfCoordinatorV2 = await ethers.getContract("VRFCoordinatorV2Mock");
		vrfCoordinatorV2Address =
			vrfCoordinatorV2.target || vrfCoordinatorV2.address;
		const txResponse = await vrfCoordinatorV2.createSubscription();
		const txReceipt = await txResponse.wait();
		subscriptionId = txReceipt.events[0].args.subId;
		await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
	} else {
		vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
		const signer = await ethers.getSigner(deployer);
		// const testVRFCoordinatorContract = await ethers.getContractAt(
		// 	"VRFCoordinatorV2Mock",
		// 	vrfCoordinatorV2Address,
		// 	signer
		// );
		const testVRFCoordinatorContract = new Contract(
			vrfCoordinatorV2Address,
			vrfCoordinatorV2ABI,
			signer
		);
		const testTxResponse =
			await testVRFCoordinatorContract.createSubscription();
		const testTxReceipt = await testTxResponse.wait();
		subscriptionId = networkConfig[chainId].subscriptionId;
	}

	const args = [
		vrfCoordinatorV2Address,
		subscriptionId,
		networkConfig[chainId]["keyHash"],
		networkConfig[chainId]["callbackGasLimit"],
		tokenUris,
		networkConfig[chainId]["mintFee"],
	];

	// const randomIpfsNft = await deploy("RandomIpfsNft", {
	// 	from: deployer,
	// 	args: args,
	// 	log: true,
	// 	waitConfirmations: network.config.blockConfirmations || 1,
	// });
};

async function handleTokenUris() {
	const { responses: imageUploadResponses, files } =
		await storeImages(IMAGE_PATH);

	for (imageUploadResponseIdx in imageUploadResponses) {
		let tokenUriMetadata = { ...metadataTemplate };
		tokenUriMetadata.name = files[imageUploadResponseIdx]
			.replace(".png", "")
			.replace("jpeg", "");
		tokenUriMetadata.description = `You will save the planet with ${tokenUriMetadata.name}`;
		tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIdx].IpfsHash}`;

		console.log(`UPLOADING ${tokenUriMetadata.name}......`);

		const metadataUploadResponse =
			await storeTokenUriMetadata(tokenUriMetadata);

		tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`);

		console.log(tokenUris);
	}
}
