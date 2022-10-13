import { HardhatUserConfig } from "hardhat/config"
// import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-waffle"
import "dotenv/config"

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        mumbai: {
            url: process.env.MUMBAI_END_POINT,
            accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
            chainId: 80001,
        },
    },
    solidity: "0.8.9",
}

export default config
