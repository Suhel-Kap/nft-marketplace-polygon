// import "../styles/globals.css";

import Link from "next/link"

export default function Navbar() {
    return (
        <nav className="flex justify-between items-center border-b p-6 mb-3">
            <h1 className="text-5xl font-bold">NFT Marketplace</h1>
            <div className="flex mt-4">
                <Link href={"/"}>
                    <a className="mr-6 text-fuchsia-500">Home</a>
                </Link>
                <Link href={"/create-item"}>
                    <a className="mr-6 text-fuchsia-500">Create Item</a>
                </Link>
                <Link href={"/my-assets"}>
                    <a className="mr-6 text-fuchsia-500">My Digital Assets</a>
                </Link>
                <Link href={"/creator-dashboard"}>
                    <a className="mr-6 text-fuchsia-500">Creator Dashboard</a>
                </Link>
            </div>
        </nav>
    )
}
