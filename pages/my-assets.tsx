import Web3Modal from "web3modal"
import { ethers } from "ethers"
import { useState, useEffect } from "react"
import axios from "axios"

import { nftAddress, nftMarketddress } from "../config"
import NFT from "../artifacts/contracts/NFT.sol/NFT.json"
import NFTMarketplace from "../artifacts/contracts/NFTMarket.sol/NFTMarketplace.json"
import { useRouter } from "next/router"

export default function MyAssets() {
    const [nfts, setNfts] = useState<
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
    const router = useRouter()
    const loadNfts = async () => {
        const web3modal = new Web3Modal()
        const connection = await web3modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const tokenContract = new ethers.Contract(nftAddress, NFT.abi, signer)
        const marketContract = new ethers.Contract(nftMarketddress, NFTMarketplace.abi, signer)
        const data = await marketContract.fetchMyNFTs()

        const items: any[] = await Promise.all(
            data.map(
                async (i: {
                    tokenId: { toNumber: () => any }
                    price: { toString: () => ethers.BigNumberish }
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
                    }
                    // console.log(item)
                    return item
                }
            )
        )
        setNfts(items)
        setLoadingState("loaded")
    }

    return (
        <div className="flex justify-center">
            {loadingState === "loaded" && !nfts.length && (
                <h1 className="px-20 py-10 text-3xl">No assets owned</h1>
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
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
