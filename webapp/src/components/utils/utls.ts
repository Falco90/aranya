import { CreatorNFT } from "@/types/course";

export function ipfsToHttp(uri: string) {
    if (!uri) return uri
    return uri.replace("ipfs://", "https://ipfs.io/ipfs/")
}

export function getNextMilestone(completions: number): number {
    console.log("completions: ", completions);
    if (completions < 1) return 1
    if (completions < 2) return 2
    if (completions < 3) return 3
    if (completions < 500) return 500
    return 1000
}

export function getAttribute(nft: CreatorNFT, trait: string): number {
    const attr = nft.attributes.find(a => a.trait_type === trait)
    return attr ? Number(attr.value) : 0
}
