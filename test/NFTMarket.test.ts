import { expect, assert } from "chai"
import { ethers } from "hardhat"

describe("NFTMarket", function () {
    it("Should create and execute market sales", async function () {
        /* deploy the marketplace */
        const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace")
        const nftMarketplace = await NFTMarketplace.deploy()
        await nftMarketplace.deployed()
        const address = nftMarketplace.address

        const NFT = await ethers.getContractFactory("NFT")
        const nft = await NFT.deploy(address)
        await nft.deployed()
        const nftContractAddress = nft.address

        let listingPrice = await nftMarketplace.getListingPrice()
        listingPrice = listingPrice.toString()

        const auctionPrice = ethers.utils.parseUnits("100", "ether")

        await nft.createToken("https://www.mytokenlocation.com")
        await nft.createToken("https://www.mytokenlocation2.com")

        /* create two tokens */
        await nftMarketplace.createMarketItem(nftContractAddress, 1, auctionPrice, {
            value: listingPrice,
        })
        await nftMarketplace.createMarketItem(nftContractAddress, 2, auctionPrice, {
            value: listingPrice,
        })

        const [_, buyerAddress] = await ethers.getSigners()

        /* execute sale of token to another user */
        await nftMarketplace
            .connect(buyerAddress)
            .sellMarketItem(nftContractAddress, 1, { value: auctionPrice })

        /* query for and return the unsold items */
        let items: any[]
        items = await nftMarketplace.fetchMarketItems()
        items = await Promise.all(
            items.map(async (i) => {
                const tokenUri = await nft.tokenURI(i.tokenId)
                let item = {
                    price: i.price.toString(),
                    tokenId: i.tokenId.toString(),
                    seller: i.seller,
                    owner: i.owner,
                    tokenUri,
                }
                return item
            })
        )
        console.log("items: ", items)
    })
})
