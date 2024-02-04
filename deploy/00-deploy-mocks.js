const { network } = require("hardhat");
const {
	developmentNetworks,
	chainConfig,
} = require("../helper-hardhat-config");

const BASE_FEE = "250000000000000000"; // 0.25 is this the premium in LINK?
const GAS_PRICE_LINK = 1e9; // link per gas, is this the gas lane? // 0.000000001 LINK per gas

module.exports = async ({ deployments, getNamedAccounts }) => {
	const { deployer } = await getNamedAccounts();
	const { deploy, log } = deployments;

	if (developmentNetworks.includes(network.name.toLowerCase())) {
		log("Local network detected. Deploying mocks.........");

		const vrfCoordinatorV2Mock = await deploy("VRFCoordinatorV2Mock", {
			from: deployer,
			args: [BASE_FEE, GAS_PRICE_LINK],
			log: true,
		});

		log(`Mock VRFCoordinatorV2 deployed at ${vrfCoordinatorV2Mock.address}`);
	}
};
