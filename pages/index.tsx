import { ethers } from "ethers"
import { useState, useEffect } from "react"
import axios from "axios"
import Web3Modal from "web3modal"
import { nftAddress, nftMarketddress } from "../config"

import NFT from "../artifacts/contracts/NFT.sol/NFT.json"
import NFTMarketplace from "../artifacts/contracts/NFTMarket.sol/NFTMarketplace.json"

export default function Home() {
    const [nfts, setNfts] = useState<
        Array<{
            name: string
            description: string
            price: string
            image: any
            tokenId: any
        }>
    >([])
    const [loadingState, setLoadingState] = useState("not-loaded")

    useEffect(() => {
        loadNfts()
    }, [nfts])

    const loadNfts = async () => {
        const provider = new ethers.providers.JsonRpcProvider()
        const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider)
        const marketContract = new ethers.Contract(nftMarketddress, NFTMarketplace.abi, provider)
        const data = await marketContract.fetchMarketItems()

        const items: any[] = await Promise.all(
            data.map(
                async (i: {
                    tokenId: { toNumber: () => any }
                    price: string
                    seller: any
                    owner: any
                }) => {
                    const tokenUri = await tokenContract.tokenURI(i.tokenId)
                    const meta = await axios.get(tokenUri)
                    let price = ethers.utils.formatUnits(i.price.toString(), "ether")
                    let item = {
                        price,
                        tokenId: i.tokenId.toNumber(),
                        seller: i.seller,
                        owner: i.owner,
                        image: meta.data.image,
                        name: meta.data.name,
                        description: meta.data.description,
                    }
                    console.log(item)
                    return item
                }
            )
        )
        setNfts(items)
        setLoadingState("loaded")
    }

    const buyNfts = async (nft: { tokenId: any; price: string }) => {
        const web3modal = new Web3Modal()
        const connection = await web3modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)

        const signer = provider.getSigner()
        const contract = new ethers.Contract(nftMarketddress, NFTMarketplace.abi, signer)

        const price = ethers.utils.parseUnits(nft.price.toString(), "ether")
        const tx = await contract.sellMarketItem(nftAddress, nft.tokenId, { value: price })
        await tx.wait(1)

        loadNfts()
    }

    return (
        <div className="flex justify-center">
            {loadingState === "loaded" && !nfts.length && (
                <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>
            )}

            <div className="px-4" style={{ maxWidth: "1600px" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {nfts.map((nft, i) => (
                        <div
                            key={i}
                            className="border shadow rounded-xl overflow-hidden"
                            style={{ maxHeight: "575px" }}
                        >
                            <div className="max-h-72 h-64 mb-1">
                                <img src={nft.image} className="max-h-72" />
                            </div>

                            <div className="p-4">
                                <p style={{ height: "64px" }} className="text-2xl font-semibold">
                                    {nft.name}
                                </p>
                                <div style={{ height: "70px", overflow: "hidden" }}>
                                    <p className="text-gray-400">{nft.description}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-black">
                                <p className="text-2xl font-bold text-white">{nft.price} MATIC</p>
                                <button
                                    className="mt-4 w-full bg-fuchsia-600 text-white font-bold py-2 px-12 rounded"
                                    onClick={() => buyNfts(nft)}
                                >
                                    Buy
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
