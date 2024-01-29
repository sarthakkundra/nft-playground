const { network } = require("hardhat");
const {
	developmentNetworks,
	networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
require("dotenv").config();

module.exports = async ({ deployments, getNamedAccounts }) => {
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();

	const basicNft = await deploy("BasicNft", {
		from: deployer,
		args: [],
		log: true,
		waitForConfirmations: network.config.blockConfirmations || 1,
	});

	if (
		!developmentNetworks.includes(network.name) &&
		process.env.ETHERSCAN_API_KEY
	) {
		log("VERIFYING..........");
		await verify(basicNft.address, args);
	}
};
