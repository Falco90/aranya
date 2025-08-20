import { CreatorNFT } from "@/types/course";

export function ipfsToHttp(uri: string) {
    if (!uri) return uri
    return uri.replace("ipfs://", "https://ipfs.io/ipfs/")
}

export function getNextCreatorMilestone(completions: number): number {
    if (completions < 1) return 1
    if (completions < 2) return 2
    if (completions < 3) return 3
    if (completions < 500) return 500
    return 1000
}

export function getNextLearnerMilestone(progressPercentage: number): number {
    if (progressPercentage < 25) return 25
    if (progressPercentage < 50) return 50
    if (progressPercentage < 75) return 75
    if (progressPercentage < 100) return 100
    return 100
}


export function getAttribute(nft: CreatorNFT, trait: string): number {
    const attr = nft.attributes.find(a => a.trait_type === trait)
    return attr ? Number(attr.value) : 0
}

export function truncateAddress(address: string): string {
    if (!address || address.length < 10) return address; // fallback for invalid addresses
    const start = address.slice(0, 6); // "0x" + first 4 chars
    const end = address.slice(-4);     // last 4 chars
    return `${start}...${end}`;
}
