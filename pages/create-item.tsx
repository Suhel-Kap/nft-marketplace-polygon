import { ethers } from "ethers"
import { useState } from "react"
import { create as ipfsHttpClient } from "ipfs-http-client"
import { useRouter } from "next/router"
import Web3Modal from "web3modal"

const client = ipfsHttpClient({ url: "https://ipfs.infura.io:5001/api/v0" })

import { nftAddress, nftMarketddress } from "../config"
import NFT from "../artifacts/contracts/NFT.sol/NFT.json"
import NFTMarketplace from "../artifacts/contracts/NFTMarket.sol/NFTMarketplace.json"

export default function CreateItem() {
    const [fileUrl, setFileUrl] = useState("")
    const [formInput, updateFormInput] = useState({ price: "", name: "", description: "" })
    const router = useRouter()

    const onChange: any = async (e: { target: { files: any[] } }) => {
        const file = e.target.files[0]
        try {
            const added = await client.add(file, {
                progress: (prog) => console.log(`received: ${prog}`),
            })
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            setFileUrl(url)
        } catch (error) {
            console.log(error)
        }
    }

    const createItem = async () => {
        const { name, description, price } = formInput
        if (!name || !description || !price || !fileUrl) return
        const data = JSON.stringify({ name, description, image: fileUrl })

        try {
            const added = await client.add(data)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            createSale(url)
        } catch (error) {
            console.log(error)
        }
    }

    const createSale = async (url: string) => {
        const web3modal = new Web3Modal()
        const connection = await web3modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        let contract = new ethers.Contract(nftAddress, NFT.abi, signer)
        let transactionResponse = await contract.createToken(url)
        let tx = await transactionResponse.wait(1)

        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()

        const price = ethers.utils.parseEther(formInput.price)

        contract = new ethers.Contract(nftMarketddress, NFTMarketplace.abi, signer)
        let listingPrice = await contract.getListingPrice()
        listingPrice = listingPrice.toString()

        transactionResponse = await contract.createMarketItem(nftAddress, tokenId, price, {
            value: listingPrice,
        })
        await transactionResponse.wait(1)

        router.push("/")
    }

    return (
        <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
                <input
                    className="mt-8 border rounded p-4"
                    placeholder="Asset Name"
                    onChange={(e) => updateFormInput({ ...formInput, name: e.target.value })}
                />
                <textarea
                    className="mt-2 border rounded p-4"
                    placeholder="Asset Description"
                    onChange={(e) =>
                        updateFormInput({ ...formInput, description: e.target.value })
                    }
                />
                <input
                    className="mt-2 border rounded p-4"
                    placeholder="Asset Price in MATIC"
                    type={"number"}
                    onChange={(e) => updateFormInput({ ...formInput, price: e.target.value })}
                />
                <input type={"file"} name="Asset" className="my-4" onChange={onChange} />
                {fileUrl && <img className="rounded mt-4" width={350} src={fileUrl} />}
                <button
                    onClick={createItem}
                    className="font-bold mt-4 bg-fuchsia-500 text-white rounded p-4 shadow-lg"
                >
                    Create digital asset
                </button>
            </div>
        </div>
    )
}
