/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-console */

"use client";

import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3Auth } from "@web3auth/modal";
import { useEffect, useState } from "react";
import styles from './page.module.css';
import {
  SignProtocolClient,
  SpMode,
  EvmChains,
  OffChainSignType,
  
} from "@ethsign/sp-sdk";
import RPC from "./ethersRPC";
import { ethers } from 'ethers';
import { privateKeyToAccount } from "viem/accounts";






const clientId = "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ"; // get from https://dashboard.web3auth.io


const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7",
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  // Avoid using public rpcTarget in production.
  // Use services like Infura, Quicknode etc
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});


const web3auth = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
    privateKeyProvider,
});

export async function getAddr() {
  return (await RPC.getAccounts(web3auth.provider))
}

export async function getPrivKey() {
  try {
    const privateKey = await web3auth.provider.request({
      method: "eth_private_key"
    });
    return privateKey
  } catch {
    return undefined
  }
}

export async function loginExport() {
  try {
    const web3authProvider = await web3auth.connect();
  } catch { }
}

function stringToHex(str: string): string {
    // Convert each character to its UTF-16 code unit (byte) and then to hex
    return Array.from(str).map(char => 
        char.charCodeAt(0).toString(16).padStart(4, '0')
    ).join('');
}


export async function attest(url: string, safetyRating:  number, overallRating:number ) {

    

  // Create attestation
  /**
const attestationInfo = await client.createAttestation({
  schemaId: "SPS_zKtN7H9Ot8FXEx1J0o0BZ", // `schemaInfo.schemaId` or other `schemaId`
  data: { rating: 5 },
  indexingValue: "1",
});*/
  
  try {
    const privateKey = await web3auth.provider.request({
      method: "eth_private_key"
    });
    console.log("Fetched key")
    console.log(privateKey)
    
    const client = new SignProtocolClient(SpMode.OffChain, {
  signType: OffChainSignType.EvmEip712,
      account: privateKeyToAccount("0x"+privateKey)
    });
    
    console.log("Formed schema")
    
    const attestationInfo = await client.createAttestation({
  schemaId: "SPS_5mYehcsYy7_McrqM7kpPQ", // `schemaInfo.schemaId` or other `schemaId`
  data: { urlInput: url, safety: safetyRating, overall: overallRating},
  indexingValue: "1",
    });
    
    console.log("Attested")
    
   
  } catch (e) {
    console.log(e)
     const client = new SignProtocolClient(SpMode.OffChain, {
  signType: OffChainSignType.EvmEip712,
      
    });
    
    console.log("Formed schema")
    
    /**const attestationInfo = await client.createAttestation({
  schemaId: "SPS_LSo4ae_Rl4OrDFd7_CVzy", // `schemaInfo.schemaId` or other `schemaId`
  data: { url: url, safetyRating: safetyRating, overallRating: overallRating},
  indexingValue: "1",
    });**/

    const attestationInfo = await client.createAttestation({
  schemaId: "SPS_5mYehcsYy7_McrqM7kpPQ", // `schemaInfo.schemaId` or other `schemaId`
  data: { urlInput: url, safety: safetyRating, overall: overallRating},
  indexingValue: "1",
    });

    console.log("Attested")
  }


  

}
  

  

import { MetamaskAdapter } from "@web3auth/metamask-adapter";
const metamaskAdapter = new MetamaskAdapter({
  clientId,
  sessionTime: 3600, // 1 hour in seconds
  web3AuthNetwork: "sapphire_mainnet",
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x1",
    rpcTarget: "https://rpc.ankr.com/eth", // This is the public RPC we have added, please pass on your own endpoint while creating an app
  },
});

// it will add/update  the metamask adapter in to web3auth class
web3auth.configureAdapter(metamaskAdapter);

// You can change the adapter settings by calling the setAdapterSettings() function on the adapter instance.
metamaskAdapter.setAdapterSettings({
  sessionTime: 86400, // 1 day in seconds
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x1",
    rpcTarget: "https://rpc.ankr.com/eth", // This is the public RPC we have added, please pass on your own endpoint while creating an app
  },
  web3AuthNetwork: "sapphire_mainnet",
});

interface ConnectButtonProps {
  broadcastLoginStatus: (loggedIn: boolean) => void;
}

const ConnectButton: React.FC<ConnectButtonProps> = ({ broadcastLoginStatus }) => {

  
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    broadcastLoginStatus(loggedIn)
    console.log(loggedIn)
  }, [loggedIn])

  useEffect(() => {
    const init = async () => {
      try {
        await web3auth.initModal();
        setProvider(web3auth.provider);

        if (web3auth.connected) {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const login = async () => {
    try {
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      if (web3auth.connected) {
        setLoggedIn(true);
      }
    } catch { }
  };

  const getUserInfo = async () => {
    const user = await web3auth.getUserInfo();
    uiConsole(user);
  };

  const logout = async () => {
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
    //uiConsole("a");
  };

  // Check the RPC file for the implementation
  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const address = await RPC.getAccounts(provider);
    uiConsole(address);
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const balance = await RPC.getBalance(provider);
    uiConsole(balance);
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const signedMessage = await RPC.signMessage(provider);
    uiConsole(signedMessage);
  };

  const sendTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    uiConsole("Sending Transaction...");
    const transactionReceipt = await RPC.sendTransaction(provider);
    uiConsole(transactionReceipt);
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
      console.log(...args);
    }
  }

  const loggedInView = (

      <div>
        
        
          <button className={styles.connectbutton} onClick={logout} >
            Log Out
          </button>
       
      </div>
   
  );

  const unloggedInView = (
    <button className={styles.connectbutton} onClick={login}>
      Login
    </button>
  );



  return (
    <div className={styles.connectbuttoncontainer}>


      <div >{loggedIn ? loggedInView : unloggedInView}</div>
     

    
    </div>
  );
}

export default ConnectButton;