import { ethers } from "ethers";
import IFlareContractRegistry from "../../abis/fdc/IFlareContractRegistry.json";
import IFlareSystemsManager from "../../abis/fdc/IFlareSystemsManager.json";
import IRelay from "../../abis/fdc/IRelay.json";
import IFdcVerification from "../../abis/fdc/IFdcVerification.json";
import IFdcHub from "../../abis/fdc/IFdcHub.json";

const FLARE_CONTRACT_REGISTRY_ADDRESS = "0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019";	

const provider = new ethers.JsonRpcProvider(process.env.COSTON2_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

export async function getFlareContractRegistry() {
    return new ethers.Contract(
        FLARE_CONTRACT_REGISTRY_ADDRESS,
        IFlareContractRegistry.abi,
        provider
    );
}

export async function getContractAddressByName(name: string) {
    const registry = await getFlareContractRegistry();
    return await registry.getContractAddressByName(name);
}

async function getContract(name: string, abi: any, useSigner: boolean = false) {
    const address = await getContractAddressByName(name);
    if (useSigner) {
        return new ethers.Contract(address, abi, signer);
    }
    return new ethers.Contract(address, abi, provider);
}

export const getFlareSystemsManager = () => getContract("FlareSystemsManager", IFlareSystemsManager.abi);
export const getRelay = () => getContract("Relay", IRelay.abi);
export const getFdcVerification = () => getContract("FdcVerification", IFdcVerification.abi);
export const getFdcHub = () => getContract("FdcHub", IFdcHub.abi, true);
