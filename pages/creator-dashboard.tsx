import { ethers } from "ethers"
import { useState, useEffect } from "react"
import axios from "axios"
import Web3Modal from "web3modal"
import { nftAddress, nftMarketddress } from "../config"

import NFT from "../artifacts/contracts/NFT.sol/NFT.json"
import NFTMarketplace from "../artifacts/contracts/NFTMarket.sol/NFTMarketplace.json"

export default function CreatorDashboard() {
    const [nfts, setNfts] = useState<
        Array<{
            name: string
            description: string
            price: string
            image: any
            tokenId: any
        }>
    >([])
    const [soldNfts, setSoldNfts] = useState<
        Array<{
            name: string
            description: string
            price: string
            image: any
            tokenId: any
        }>
    >([])
    const [loadingState, setLoadingState] = useState<String>("not-loaded")
    useEffect(() => {
        loadNfts()
    }, [])

    const loadNfts = async () => {
        const web3modal = new Web3Modal()
        const connection = await web3modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const tokenContract = new ethers.Contract(nftAddress, NFT.abi, signer)
        const marketContract = new ethers.Contract(nftMarketddress, NFTMarketplace.abi, signer)
        const data = await marketContract.itemsCreated()
        console.log("data", data)

        const items: any[] = await Promise.all(
            data.map(
                async (i: {
                    tokenId: { toNumber: () => any }
                    price: { toString: () => ethers.BigNumberish }
                    seller: any
                    owner: any
                }) => {
                    const tokenUri = (await tokenContract.tokenURI(i.tokenId)).replace("ipfs.infura", "infura-ipfs")
                    console.log("tokenUri", tokenUri)
                    const meta = await axios.get(tokenUri)
                    console.log("meta", meta)
                    let price = ethers.utils.formatUnits(i.price.toString(), "ether")
                    let item = {
                        price,
                        tokenId: i.tokenId.toNumber(),
                        seller: i.seller,
                        owner: i.owner,
                        image: (meta.data.image).replace("ipfs.infura", "infura-ipfs"),
                        name: meta.data.name,
                        sold: meta.data.sold,
                    }
                    console.log(item)
                    return item
                }
            )
        )
        const soldItems = items.filter((i) => i.sold)
        setSoldNfts(soldItems)
        setNfts(items)
        setLoadingState("loaded")
    }
    if (loadingState === "loaded" && !nfts.length)
        return <h1 className="py-10 px-20 text-3xl">No NFTs listed</h1>
    return (
        <div className="flex justify-center flex-col p-4">
            <h2 className="text-2xl py-2">Items Created</h2>
            <div className="px-4" style={{ maxWidth: "1600px" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {nfts.map((nft, i) => (
                        <div
                            key={i}
                            className="border shadow rounded-xl overflow-hidden"
                            style={{ maxHeight: "400px" }}
                        >
                            <div className="max-h-72 h-64 mb-1">
                                <img src={nft.image} className="max-h-72" />
                            </div>

                            <div className="p-2">
                                <p style={{ height: "32px" }} className="text-2xl font-semibold">
                                    {nft.name}
                                </p>
                            </div>
                            <div className="p-4 bg-black">
                                <p className="text-2xl font-bold text-white">{nft.price} MATIC</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {soldNfts.length && (
                <div>
                    <h2 className="text-2xl py-2">Items Sold</h2>
                    <div className="px-4" style={{ maxWidth: "1600px" }}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                            {soldNfts.map((nft, i) => (
                                <div
                                    key={i}
                                    className="border shadow rounded-xl overflow-hidden"
                                    style={{ maxHeight: "400px" }}
                                >
                                    <div className="max-h-72 h-64 mb-1">
                                        <img src={nft.image} className="max-h-72" />
                                    </div>

                                    <div className="p-2">
                                        <p
                                            style={{ height: "32px" }}
                                            className="text-2xl font-semibold"
                                        >
                                            {nft.name}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-black">
                                        <p className="text-2xl font-bold text-white">
                                            {nft.price} MATIC
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
