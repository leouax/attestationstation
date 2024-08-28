'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import SearchBox from './searchbox';
import ConnectButton from './connect';
import { attest, getAddr, getPrivKey, loginExport } from './connect';
import {
  IndexService
} from "@ethsign/sp-sdk";
const indexService = new IndexService("mainnet")


function simplifyUrl(url: string): string {
  // Remove the scheme (http:// or https://)
  let simplifiedUrl = url.replace(/^https?:\/\//, '');

  // Remove 'www.' if it exists
  simplifiedUrl = simplifiedUrl.replace(/^www\./, '');

  return simplifiedUrl;
}

async function fetchAttestationsByAddr(attesterAddr: string) {
  const res = await indexService.queryAttestationList({
  schemaId: "SPS_5mYehcsYy7_McrqM7kpPQ",
  attester: attesterAddr,
  page: 1,
  mode: "offchain",
  });
  return res
}

interface Dictionary {
    [key: string]: any; // 'any' can be replaced with more specific types if known
}

export async function fetchAttestationInputById(attestationId: string): Promise<Dictionary> {
  const res = await indexService.queryAttestation(attestationId);
  const dictionary: Dictionary = JSON.parse(res.data);

  return dictionary
}

export async function fetchAllAttestations() {
  const res = await indexService.queryAttestationList({
  schemaId: "SPS_5mYehcsYy7_McrqM7kpPQ",
  page: 1,
  mode: "offchain",
  });
  return res
}

async function fetchMessagesByUrl(url:string) {
    try {
          const response = await fetch('htts://18.188.15.55:443/api/fetch?url=' + url);
      const data = await response.json();

        console.log(data)
        return data
        } catch (error) {
          console.error('Error:', error);
          return null
        }
      };



export default function Home() {


  async function hasUserAttested(_url: string) {
    const url = await simplifyUrl(_url)
    const ids = (await fetchAttestationsByAddr(await getAddr())).rows
     for (const id of ids) {
        const data = await fetchAttestationInputById(id.id);
      if (data.urlInput === url) {
        console.log("user has attested to "+url)
        setAbleToAttest(false)
        return
        }
    }
    console.log("user has not attested to "+url)
    setAbleToAttest(true)
}


  async function calculateAttestationData(url: string) {
    let numUsers = 0;
    let totalSafety = 0;
    let totalOverall = 0;
    
    const ids = (await fetchAllAttestations()).rows;

    // Use a for...of loop to handle async/await properly
    for (const id of ids) {
        const data = await fetchAttestationInputById(id.id);

      if (data.urlInput === url) {
            numUsers += 1;
            totalSafety += data.safety;
            totalOverall += data.overall;
        }
    }
    
    setWebsiteAttestationDataJSON({numUsers: numUsers, safety: totalSafety, overall: totalOverall})
}

  

  
  const [websiteAttestationDataJSON, setWebsiteAttestationDataJSON] = useState<any>({numUsers:0, safety:0,overall:0})
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [urlValidity, setURLValidity] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<any>();
  const [imgSrc, setImgSrc] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [queryError, setQueryError] = useState<boolean>(false);
  const [loggedIn, setLoggedIn] = useState<boolean>(false)
  const [ableToAttest, setAbleToAttest] = useState<boolean>(true)
  const [conversation, setConversation] = useState<any>([])

  useEffect(() => {
    if (loggedIn) {
      if (urlValidity) {
        hasUserAttested(searchQuery)
      }
    }
  }, [loggedIn])

  function handleLoginBroadcast(trueorfalse: boolean) {
    setLoggedIn(trueorfalse) 
    console.log("received callback from child ")
  }

  async function updateConversation() {
    console.log("fetching conversation for given url")
      try {
          const response = await fetch('http://18.188.15.55:443/api/fetch?url=' + simplifyUrl(searchQuery));
        const data = await response.json();
        setConversation(data)
          return data
        } catch (error) {
          console.error('Error:', error);
          return null
        }
  }

  useEffect(() => { console.log("conversation updated"); console.log(conversation)}, [conversation])

  useEffect(() => {

    
    if (metadata) 
    {

      try {
        if (isValidUrl(metadata.favicons[0].href) == true) {
          setImgSrc(metadata.favicons[0].href)
        } else {
          setImgSrc(metadata["og:image"])
        }
        
      } catch {
        setImgSrc(metadata["og:image"])
      }
      try {
        setDescription(metadata.description)
      } catch {
        setDescription('')
      }
      document.getElementById('chatbox-input').value = '';
      hasUserAttested(searchQuery)
      calculateAttestationData(simplifyUrl(searchQuery))
      updateConversation()
      
    }


    try {
      if (metadata['error']) {
        handleQueryFail()
      }
    } catch { }
 
    
  }, [metadata])


  useEffect(() => {
    setQueryError(false)
    setSelectedSafety(undefined)
    setSelectedOverall(undefined)

    if (searchQuery !== "") {
      setURLValidity(isValidUrl(searchQuery))
      if (urlValidity) {
        const fetchData = async (url:string) => {
            try {
              const response = await fetch('http://52.14.47.63:443/api/fetch?url='+url);
              const data = await response.json(); 
              return data
            } catch (error) { 
              console.error('Error:', error);
              await handleQueryFail()
              return null
            }
        }; 

        const runFunc = async () => {
   

        console.log("querying metadata")
        const _metadata = await fetchData(searchQuery)
          console.log(_metadata)
          setMetadata(_metadata)
 
        }
        
        runFunc()
      } else {
        setMetadata('')
      }
    } else {
      setMetadata('')
      setQueryError(false)
    }
  }, [searchQuery])

  
  useEffect(() => {
    if (urlValidity) {
      const fetchData = async (url: string) => {
        try {
          const response = await fetch('http://52.14.47.63:443/api/fetch?url=' + url);
          const data = await response.json();
          return data
        } catch (error) {
          console.error('Error:', error);
          await handleQueryFail()
          return null
        }
      };

      const runFunc = async () => {
        if (urlValidity) {
          if (searchQuery !== "") {


            console.log("querying metadata")
            const _metadata = await fetchData(searchQuery)
            setMetadata(_metadata)
          }
        }
      }
      runFunc()
    }
    
  }, [urlValidity])



  function handleQueryFail() {
        console.log("handling query error")

    setQueryError(true)
      setMetadata('')

  }

  const handleQueryChange = (query: string) => {
    setSearchQuery(query);
    // You can also perform any other actions with the query here
  
  };

  function isValidUrl(url: string): boolean {
    const urlPattern = new RegExp(
      '^' +
      '(?:http|https|ftp):\\/\\/' +
      '(?:\\S+(?::\\S*)?@)?' +
      '(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\\.)+(?:[A-Z]{2,6}|[A-Z0-9-]{2,})' +
      '(?:\\:\\d+)?' +
      '(?:\\/[^\\s]*)?' +
      '$', 'i'
    );
    return urlPattern.test(url);
  }


  const [selectedSafety, setSelectedSafety] = useState<number | undefined>(undefined);

  // Handler function to update state when the selection changes
  const handleSafetyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSafety(Number(event.target.value));
  };

  const [selectedOverall, setSelectedOverall] = useState<number | undefined>(undefined);

  // Handler function to update state when the selection changes
  const handleOverallChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOverall(Number(event.target.value));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      console.log('enter pressed')

      const runFunc = async () => {
        if (loggedIn) {
          if (document.getElementById('chatbox-input').value !== '') {
            const value = encodeURIComponent(document.getElementById('chatbox-input').value)
            document.getElementById('chatbox-input').value = ''
            if (!loggedIn) {
              return
            } else {
              const response = await fetch(`http://18.188.15.55:443/api/fetch?msg=${value}&url=${simplifyUrl(searchQuery)}`)
              console.log(response)
              await updateConversation()
              // lolz
            }
                    
                    
                    
          }
        }
      }
    runFunc()
    }
      
  };
  
  return (
    <main className={styles.main}>
      <div className={styles.topdiv}>
        <p className={styles.titleheader}>AttestationStation</p>
        <p className={styles.headerdescription}>Check or attest to a website's credibility</p>
        
        <div>
        <SearchBox onQueryChange={handleQueryChange} /> {/* Pass the callback to SearchBox */}
        
        {/* Optionally display the search query */}
        
          {urlValidity || searchQuery=='' ? <></> : <p className={styles.invalidurl}>Invalid Url</p>}
      </div>
      </div>
      <ConnectButton broadcastLoginStatus ={(yesorno: boolean) => {handleLoginBroadcast(yesorno)} } />
      {metadata ?
      <div className={styles.mainpagediv}>

          <div className={styles.rightmaindiv}>
            <div className={styles.rightminicontainer}>
              <img className={styles.metadataimg} src={imgSrc}></img>
            <p className={styles.righttitlecss}>{metadata.title}</p>
              </div>
            <p>{description}</p>
            <div className={styles.attestationfieldcontainer}>
              <div className={styles.ratedtextcontainer}>
              <p className={styles.ratedtext}>{websiteAttestationDataJSON.numUsers} users have rated this platform</p>
              <p className={styles.ratedtext}>Avg. safety rating: {Math.floor(websiteAttestationDataJSON.safety/websiteAttestationDataJSON.numUsers*10)/10}</p>
              <p className={styles.ratedtext}>Avg. overall rating: {Math.floor(websiteAttestationDataJSON.overall/websiteAttestationDataJSON.numUsers*10)/10}</p>
            </div>
              {loggedIn ?  ableToAttest ?
              
                <div className={styles.attestationinputcontainer}>

                  <div>
      <label htmlFor="safety-select">Your safety rating:</label>
                    <select
                      className={styles.numselector}
        id="safety-select"
        value={selectedSafety ?? ''}
        onChange={handleSafetyChange}
      >
        <option value="" disabled>0-5</option>
        {[0, 1, 2, 3, 4, 5].map(num => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
                    </select></div>
                  

                  <div>
      <label htmlFor="overall-select">Your overall rating:</label>
                    <select
                      className={styles.numselector}
        id="overall-select"
        value={selectedOverall ?? ''}
        onChange={handleOverallChange}
      >
        <option value="" disabled>0-5</option>
        {[0, 1, 2, 3, 4, 5].map(num => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
      
                  </div>  
                  {selectedSafety !== undefined && selectedOverall !== undefined ? <button onClick={async () => {
                    await attest(simplifyUrl(searchQuery), selectedSafety, selectedOverall);
                    await hasUserAttested(searchQuery)
                    await calculateAttestationData(simplifyUrl(searchQuery))
                  } 
                  
                  } className={styles.attestbutton}>Attest</button> : <></>}
              </div>
              : <p className={styles.alreadyattestedtext}>Thanks for contributing by attesting!</p>: <p className={styles.logintext}>log in to attest</p>}
              
              
            </div>
        </div>
        <div className={styles.leftmaindiv}> 
            {urlValidity ? <div className={styles.chatdiv}><p className={styles.fontbold}>Chat about your experience</p>
              <div className={conversation.length==0 ? styles.chatcontainerzeromsgs : styles.chatcontainer}>
                {conversation.length==0 ? <p>No messages here yet</p> :  <ul>
                  {conversation.map((item, index) => (
        <div className={styles.msgcontainer}>
                      <p className={styles.indivmsg}>{item.content}</p>
                      <p>{item.sentAt.split(".")[0]}</p>
        </div>
      ))}
    </ul>}
              </div>
              <div className={styles.msginputdiv}>
            
      <input
                  type="text"
                  id="chatbox-input"
                  placeholder="type something..."
                  onKeyDown={handleKeyDown}
                  className={styles.textinputfield}
                  
      />
                <button disabled={!loggedIn} className={styles.sendmsgbutton}
                  onClick={async () => {
                    console.log(document.getElementById('chatbox-input').value)
                    if (document.getElementById('chatbox-input').value !== ''){
                    if (!loggedIn) {
                     return
                    } else {
                      const response = await fetch(`http://18.188.15.55:443/api/fetch?msg=${encodeURIComponent(document.getElementById('chatbox-input').value)}&url=${simplifyUrl(searchQuery)}`)
                      console.log(response)
                      await updateConversation()
                      document.getElementById('chatbox-input').value = ''
                    }
                    
                    
                    
                    }
                }}
                >SEND</button> 
              </div>
            </div> : <></>}
        </div>

      </div>
        : queryError ? <p className={styles.queryerror}>website query failed</p> : <></>}
      
    </main> 
  );
}

