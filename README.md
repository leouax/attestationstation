# AttestationStation

*An ETHOnline 2024 project*

Attest to or review the safety and quality of a memecoin, defi protocol, or website. Think TrustPilot, but for anything hosted online on https

To try it out, go [here](https://attestationstation.vercel.app)

To learn more, [read this section](#how-it-works)

For instructions on local deployment, go [here](#deploying-locally)

## How It Works

### Sign Protocol 

AttestationStation uses Sign Protocol for creating and storing attestations (ratings) of users' scores for websites. All attestations are stored in one schema. Upon rating a website, an attestation is constructed containing the url of the website that is being rated, the safety score that the user chose, and the overall score that the user chose. The user is then prompted to sign a message to finalize their attestation. Users can only rate a website once. 

When fetching the safety and overall scores of a website, the ```indexService.queryAttestationList()``` function is called to get a json list containg all attestations. As the script sorts through these attestations it aggregates the safety and overall score of every attestation that has the url of the queried website. Once the script has sorted through all the attestations, it averages these safety and overall scores to be displayed for the user. 

Yes, this method is inefficient and each website should have its own schema. This logic will be changed post-hackathon. 

### XMTP 

AttestationStation uses XMTP group chats to give users the opportunity to chat about websites in addition to testifying to their credibility/uncredibility. The server managing the group chats is hosted on aws. The server stores a key:pair dictionary of urls to group chat identifiers. For every url that a user queries, an api call is made to the server to create a group chat corresponding to the url if it didn't already exist. The server is also used to update the group chat display in the frontend when a user sends a message or searches a different url. When a user sends a message in a chat, the server does it on their behalf. The code was written this way because there wasn't an XMTP v3 Web SDK (only a Node.js SDK, which is what the server was built on) at the time of development. When XMTP does create a Web SDK, this project will be updated to have users sign & send their own messages.  

The code of this backend aws server can be found in the repository here 

### Web3Auth 

AttestationStation uses web3auth as a login provider. Web3Auth was used because it enables non-wallet logins, which is important as non web3-users should be able to use the platform. In this project I used the Plug & Play Web - Modal SDK with external wallet logins enabled through the web3auth metamask-adapter. 

When it comes to signing attestations, the web3auth.provider object is used. If the user is connected through a social login, the ```web3auth.provider.request({method: "eth_private_key"})``` method is called to get the private key of their generated wallet and sign the message for them. If the user is connected to a wallet, they will get a pop-up prompting them to sign the message.


## Deploying Locally 

First, git clone this repository

```
git clone https://github.com/leouax/attestationstation.git
```

Enter the directory: 
```
cd attestationstation
```

Next, to install dependencies:

```
yarn install
```

Finally, to run the development server:

```
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Alternatively, you can view the deployed version of the website at [attestationstation.vercel.app](https://attestationstation.vercel.app)

