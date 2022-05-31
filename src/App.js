import React, { useState, useEffect } from "react";
import SoulToken from "./utils/SoulToken.json";
import { NFTStorage } from "nft.storage";
import { ethers } from "ethers";
import moment from "moment";
import axios from "axios";


/* UI Components & Style*/
import "./styles/App.css";
import Layout from "./components/Layout";
import MintNFTInput from "./components/MintNFTInput";
import Status from "./components/Status";
import ImagePreview from "./components/ImagePreview";
import Link from "./components/Link";
import DisplayLinks from "./components/DisplayLinks";
import ConnectWalletButton from "./components/ConnectWalletButton";
import NFTViewer from "./components/NFTViewer";

import 'antd/dist/antd.css';
import { Button, notification } from 'antd';


const INITIAL_LINK_STATE = {
  etherscan: "",
  opensea: "",
  rarible: "",
};

const INITIAL_TRANSACTION_STATE = {
  loading: "",
  error: "",
  success: "",
  warning: "",
};

// set constant contract address cause of server in fleek has no .env
const CONTRACT_ADDRESS = "0x3C14304A8F5Cfd85929a07e30878EfD83f3e1624";// by dd
// const CONTRACT_ADDRESS = "0x935fb02F78B0dcC7C5D75BDFB9071f6CE60C5C91";
// const CONTRACT_ADDRESS = "0x8F14b5c9C96De13c306F19Ff791C19d86Fc09400";
const ipfsBaseGate = "https://nftstorage.link/ipfs/";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [description,setDescription] = useState("");
  const [doubleIssuance,setDoubleIssuance] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [selectEventID, setSelectEventID] = useState("");
  const [fileBlob, setFileBlob] = useState("");
  const [cHistory, setCHistory] = useState("");
  const [cPending, setCPending] = useState("");
  const [createdCount, setCreatedCount] = useState("");
  const [NFTsToMint, setNFTsToMint] = useState("");
  const [linksObj, setLinksObj] = useState(INITIAL_LINK_STATE);
  const [imageView, setImageView] = useState("");
  // const [nftCollectionData, setNftCollectionData] = useState("");
  const [recentlyMinted, setRecentlyMinted] = useState("");
  const [transactionState, setTransactionState] = useState(
    INITIAL_TRANSACTION_STATE
  );
  const { loading, error, success } = transactionState; //make it easier

  /* runs on page load - checks wallet is connected */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  /* If a wallet is connected, do some setup */
  useEffect(() => {
    setUpEventListener();
    setCPending("");
    setCHistory("");
    fetchNFTCollection();
  }, [currentAccount]);

  /* Check for a wallet */
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      // console.log("We have the ethereum object", ethereum);

      console.log("---------------------------------")
      setUpEventListener();
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length !== 0) {
      setCurrentAccount(accounts[0]);
      console.log("account:",currentAccount);
    } else {
      console.log("No authorized account found");
    }
  };

  /* Connect a wallet */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected:", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  /* Listens for events emitted from the solidity contract, to render data accurately */
  const setUpEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          SoulToken.abi,
          signer
        );
        
        let countByAddr = await connectedContract.pendingConfirmCount(currentAccount);
        setNFTsToMint(countByAddr.toNumber());
        // console.log("setUpEventListener---->NFTsToMint:",NFTsToMint);
        
        connectedContract.on(
          "MakePropose",
          (sender, party, proposeHash, eventId) => {
            console.log("get a propose sendrequest ok, fetch it now....");
            // console.log(sender, " build a eventID=",eventId,",means:",selectEventID," nft for address: ",party,",hash is:  ",proposeHash);
            // fetchNFTCollection();
          }
        );

        // const filter = {
        //   address: CONTRACT_ADDRESS,
        //   topics: [
        //     ethers.utils.id('Transfer(address,address,uint256)')
        //   ]
        //   }       
        connectedContract.on("TokenMinted",
          (newItemId, tokenURI) => {
            // console.log("newItemId, :",newItemId.toNumber());
            // console.log(", _tokenURI:",tokenURI);
            setLinksObj({
              ...linksObj,
              opensea: `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${newItemId.toNumber()}`,
            });
            // fetchNFTCollection();
            console.log("listener");
          }
        );

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      // console.log(error);
    }
  };

  /* Helper function for createNFTData */
  const resetState = () => {
    setLinksObj(INITIAL_LINK_STATE);
    setName("");
    setReceiverAddress("");
    setImageView("");
  }

  /* Helper function for createNFTData */
  const createImageView = (metadata) => {
    let imgViewArray = metadata.data.image.pathname.split("/");
    let imgViewString = `https://${imgViewArray[2]}.ipfs.dweb.link/${imgViewArray[3]}`;
    setImageView(
      imgViewString
    );
    console.log(
      "image view set",
      `https://${imgViewArray[2]}.ipfs.dweb.link/${imgViewArray[3]}`
    );
  } 

  /* Create the IPFS CID of the json data */
  const createNFTData = async () => {
    // console.log("saving to NFT storage...");
    resetState();
    // console.log("clear state...");
    setTransactionState({
      ...INITIAL_TRANSACTION_STATE,
      loading: "Approve the transaction to issue soul token.",
    });
    // console.log("tx state clear");

    //image contains any File or Blob you want to save
    let connectionID = 1;
    connectionID = (selectEventID==='Citizenship') ? (connectionID=2) : (connectionID=1);
    // console.log("connectionID----you select ",connectionID);

    // let imageData = new File(
    //   [
    //     `${baseSVG}${name}</text></svg>`,
    //   ],
    //   `SoulTokens.svg`,
    //   {
    //     type: "image/svg+xml",
    //   }
    // );
    // console.log("imageData:::::",imageData);

    let imageData = fileBlob.files[0];

    let jsonData = {
      name: `${name}`,
      description: `${description}`,
      attributes: [
        {"trait_type": "Issuer",
        "value": `${currentAccount}`
      },       
        {"trait_type": "Attester",
      "value": `${receiverAddress}`
      },
      
      ],
      connectionID: `${connectionID}`,
      doubleIssuance:`${doubleIssuance}`,
      image: imageData,          
    };

    const client = new NFTStorage({
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDhiNGFGRDdENTBiZDYxOEZlRjhhNDUzMThiYmMwMDk1YjdDMTc5RjEiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1MTgyNzE0Nzg1OCwibmFtZSI6InRleHR2ZXJzZS1wcmQifQ.nzqaau57VZE-n_RuK5wOV5gVeffDicK8EHrvSKoN7Uo"
    });
    // token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDhiNGFGRDdENTBiZDYxOEZlRjhhNDUzMThiYmMwMDk1YjdDMTc5RjEiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1MTgyNzE0Nzg1OCwibmFtZSI6InRleHR2ZXJzZS1wcmQifQ.nzqaau57VZE-n_RuK5wOV5gVeffDicK8EHrvSKoN7Uo"
    try {
      await client
        .store(jsonData)
        .then((metadata) => {
          // console.log(metadata)
          setTransactionState({
            ...transactionState,
            success: "Saved NFT data to NFT.Storage...!! ",
            loading: "",
          });
          console.log("metadata saved", metadata);

          // createImageView(metadata);  //todo
          // const status = await client.status(metadata.ipnft);
          askContractToMintNft(metadata.url);
        });
    } catch (error) {
      console.log(error)
      console.log("Could not save NFT to NFT.Storage - Aborted minting");
      setTransactionState({
        ...INITIAL_TRANSACTION_STATE,
        error: "Could not save NFT to NFT.Storage - Aborted minting",
      });
    }
  };

  const askContractToMintNft = async (IPFSurl) => {
    // console.log("herer enter askContractToMintNft")
    //should check the wallet chain is correct here
    setTransactionState({
      ...INITIAL_TRANSACTION_STATE,
      loading: "Approve the transaction to issue soul token.",
    });

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          SoulToken.abi,
          signer
        );

        console.log("Opening wallet");
        // sendRequest
        // _party (address), _eventId (uint256), _mutualMint (bool), _tokenURI (string)
        let nftTxn = await connectedContract.sendRequest(receiverAddress, 2, true, IPFSurl);
        let successString = "Transaction approved, please invite your friends to attest and collect the soul token.";
        connectedContract.on(
          "MakePropose",
          (from, to,proposeHash, eventId) => {
            console.log(from, " build a eventID=",eventId.toNumber(),",means:",selectEventID," nft for address: ",to,",hash is:  ",proposeHash);
            // setLinksObj({
            //   ...linksObj,
            //   opensea: `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/`,
            //   rarible: `https://rinkeby.rarible.com/token/${CONTRACT_ADDRESS}/`,
            //   etherscan: `https://rinkeby.etherscan.io/tx/${nftTxn.hash}`,
            // });
          }
        );

        //SHOULD UPDATE IMAGELINK to returned value
        await nftTxn.wait();
        setTransactionState({
          ...INITIAL_TRANSACTION_STATE,
          success: successString,
        });
      } else {
        console.log("Ethereum object doesn't exist!");
        setTransactionState({
          ...INITIAL_TRANSACTION_STATE,
          error: `No Wallet connected`,
        });
      }
    } catch (error) {
      setTransactionState({
        ...INITIAL_TRANSACTION_STATE,
        error: `Error Minting NFT. ${error.message}`,
      });
    }
  };

  /* Helper function - manipulating the returned CID into a http link using IPFS gateway */
  const createIPFSgatewayLink = (el) => {
    console.log("el",el);
    let link = el[1].split("/");
    let fetchURL = `https://${link[2]}.ipfs.dweb.link/${link[3]}`;
    return fetchURL;
  };

  // notification
  const openNotification = (successStr) => {
    const key = `open${Date.now()}`;
    const btn = (
      <Button type="primary" size="small" onClick={() => notification.close(key)}>
        Confirm
      </Button>
    );
    notification.open({
      message: 'Notification Title',
      description:
      successStr,
      btn,
      key,
      // onClose: close,
    });
  };

  // show image 2
  // const createImageURLsForRetrieval =  (collection) => collection.map(
  //   async(item,index)=> {
  //     console.log("item",item);
  //     console.log("index",index);
  //     // let imgUrls2 = [];
  //   });

 /* Function to get our collection Data from
    1. The blockchain
    2. Filecoin via IPFS addressing & http gateways
 */
  const fetchNFTCollection = async () => {
    console.log("fetching nft collection..............................");
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          SoulToken.abi,
          signer
        );
        // 2> get the data as a receiver begin
        // get pending count
        let NFTsToMint = await connectedContract.pendingConfirmCount(currentAccount);
        setNFTsToMint(NFTsToMint.toNumber()); //update state
        // console.log("fetchNFTCollection---------->NFTsToMint:",NFTsToMint.toNumber());

        const approvePropose = async(hash) => {

          setTransactionState({
            ...INITIAL_TRANSACTION_STATE,
            loading: "Approve the transaction to mint your soul token.",
          });          

          await connectedContract.approvePropose(hash);
          connectedContract.on("TokenMinted",
            (newItemId, tokenURI) => {
              let newId = newItemId.toNumber();
              let url = `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${newId.toString()}`;
              const successStr = <a href={url} target="_blank" rel="noreferrer">New NFT Click Here!</a>;
              console.log("newItemId, :",newItemId.toNumber());
              console.log(", _tokenURI:",tokenURI);
              setLinksObj({
                ...linksObj,
                opensea: `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${newId.toString()}`,
              });

              setTransactionState({
                ...INITIAL_TRANSACTION_STATE,
                success: `Soul token minted successfully!`,
              }); 
              
              setLinksObj({
                ...linksObj,
                opensea: successStr,
              });
              // console.log("successStr:::",successStr);
              openNotification(successStr);
              // fetchNFTCollection();
            }
          ); 
          
        
        };

        let pendingItems=[];
        for(var i=0;i<NFTsToMint.toNumber();i++){
          let proposeHash = await connectedContract.pendingConfirmByIndex(currentAccount,i);
          // console.log("pendingConfirmByIndex:",proposeHash);

          let porposeDetail =  await connectedContract.proposeInfo(proposeHash);
          // console.log("porposeDetail:",porposeDetail);
          // if(parseInt(porposeDetail["from"])===0){
          //   console.log("Issuer Address is zero, has been minted already!",porposeDetail["from"]);
          // }
          let cttime = moment((porposeDetail["createAt"].toNumber())*1000).format("YYYY-MM-DD HH:mm:ss");
          let cftime = moment((porposeDetail["confirmAt"].toNumber())*1000).format("YYYY-MM-DD HH:mm:ss");
          let mMint = porposeDetail["mutualMint"] ? "true" : "false";
          let aStatus = porposeDetail["acceptStatus"] ? "true" : "false";

          let cidTemp1 = porposeDetail[3].split('/')[2];
          let nameJson1 = porposeDetail[3].split('/')[3];
          let metaIFPS =  `${ipfsBaseGate}${cidTemp1}/${nameJson1}`;
          // console.log("metaIFPS",metaIFPS);
          let jsonMeta = null;
          try{
            jsonMeta = await axios({method: 'get',url: `${metaIFPS}`});
          } catch(e){
              console.log(e);
          };
             
          // console.log("jsonMeta---mint:",jsonMeta.data['image']); 
          let noImageUrl = "no";
          let imageUrl2 = (jsonMeta) ? (ipfsBaseGate + jsonMeta.data['image'].split('/')[2] +'/'+jsonMeta.data['image'].split('/')[3]) : (noImageUrl) ;
          console.log("imageUrl2---mint:",imageUrl2);

          pendingItems.push(<p key={i}>
            "Pending proposeHash:"
           <button  onClick={()=>(parseInt(porposeDetail["from"])===0) ? alert("You have minted it already!") : approvePropose(proposeHash)}>Attest (mint)</button>
          <br/>
          "Propose Issuer:":{porposeDetail["from"]}
          <br/>
          "Propose Attester:":{porposeDetail["to"]}
          <br/>
          "Propose createAt:":{cttime}          
          <br/>
          "Propose confirmAt:":{cftime}
          <br/>
          "Propose mutualMint:":{mMint}
          <br/>
          "Propose acceptStatus:":{aStatus}

          <br/>
          "Propose eventId:":{porposeDetail["eventId"].toNumber()}
          <br/>
          "Propose tokenURI:":{porposeDetail["tokenURI"]}  
          <br />
          <img src={imageUrl2} alt="NFT You Mint" width={300} height={300}    />  
          <br/> --------------------------------------------------------------------                                                         
          </p>);
          // console.log(pendingItems[0]);
        }
        setCPending(pendingItems);

        // 3> approve to mint my invitation


        // 1> get currentAccount who create the propose
        
        // get currentAccount's propose array
        let currentPropose = await connectedContract.getproposeIdByAddr(currentAccount);
        // console.log("Propose I have:",currentPropose);
        
        let historyItems = [];
        let createdCount = 0;
        currentPropose.map(async(item,index)=> {
          createdCount  = createdCount+1;
            const hashPorposeDetail =  await connectedContract.proposeInfo(currentPropose[index]);
            // console.log("Created by you, propose hash:",item);
            // console.log("timestamp:",hashPorposeDetail["createAt"],"number:", hashPorposeDetail["createAt"].toNumber());
            let cttime = moment((hashPorposeDetail["createAt"].toNumber())*1000).format("YYYY-MM-DD HH:mm:ss");
            let cftime = moment((hashPorposeDetail["confirmAt"].toNumber())*1000).format("YYYY-MM-DD HH:mm:ss");
            let mMint = hashPorposeDetail["mutualMint"] ? "true" : "false";
            let aStatus = hashPorposeDetail["acceptStatus"] ? "true" : "false";

            // console.log("eventID:",hashPorposeDetail["eventId"]);
            // console.log("eventID:",hashPorposeDetail["eventId"].toNumber());
            let cidTemp = hashPorposeDetail[3].split('/')[2];
            let nameJson = hashPorposeDetail[3].split('/')[3];
            let uriJson =  `${ipfsBaseGate}${cidTemp}/${nameJson}`;
            let jsonMeta = await axios({method: 'get',url: `${uriJson}`});
            // console.log("jsonMeta:",jsonMeta.data['image']);  
            // hashPropose.push(jsonMeta.data);
            let imageUrl = ipfsBaseGate + jsonMeta.data['image'].split('/')[2] +'/'+jsonMeta.data['image'].split('/')[3];
            console.log("imageUrl:",imageUrl);

            historyItems.push(<p key={index}>"Pending proposeHash":{item}
            <br/>
            "Propose Issuer:":{hashPorposeDetail["from"]}
            <br/>
            "Propose Attester:":{hashPorposeDetail["to"]}
            <br/>
            "Propose createAt:":{cttime}          
            <br/>
            "Propose confirmAt:":{cftime}
            <br/>
            "Propose mutualMint:":{mMint}
            <br/>
            "Propose acceptStatus:":{aStatus}
            <br/>
            "Propose eventId:":{hashPorposeDetail["eventId"].toNumber()}
            <br/>
            "Propose tokenURI:":{hashPorposeDetail["tokenURI"]}  
            <br/> 
            <img src={imageUrl} alt="Propose You Create" width={300} height={300}    />  
            <br/> --------------------------------------------------------------------------                                                
            </p>);       
          }) ;
          setCHistory(historyItems);
          setCreatedCount(createdCount);
          
          // setRecentlyMinted();      
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      // console.log("error");
      console.log(error);
    }
  };


  /* Render our page */
  return (
    <Layout connected={currentAccount === ""} connectWallet={connectWallet}>
      <>
        {transactionState !== INITIAL_TRANSACTION_STATE && <Status transactionState={transactionState}/>}
        {imageView &&
          !linksObj.etherscan && <Link link={imageView} description="See IPFS image link"/>}
        {imageView && <ImagePreview imgLink ={imageView}/>}
        {linksObj.etherscan && <DisplayLinks linksObj={linksObj} />}
        {currentAccount === "" ? (
          <ConnectWalletButton connectWallet={connectWallet}/>
        ) : transactionState.loading ? (
          <div />
        ) : (
          <MintNFTInput 
          name={name} setName={setName} 
          NFTsToMint={NFTsToMint} currentAccount={currentAccount}
          cHistory={cHistory} cPending={cPending} createdCount={createdCount}
           setSelectEventID={setSelectEventID} 
           description={description} setDescription={setDescription}
           setDoubleIssuance={setDoubleIssuance} setFileBlob={setFileBlob}
          receiverAddress={receiverAddress} setReceiverAddress={setReceiverAddress} 
          transactionState={transactionState} 
          createNFTData={createNFTData}/>
        )}
        {recentlyMinted && <NFTViewer recentlyMinted={recentlyMinted}/>}
      </>
    </Layout>
  );
};

export default App;
