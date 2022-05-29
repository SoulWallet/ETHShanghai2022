import React, { useState, useEffect } from "react";
import SoulToken from "./utils/SoulToken.json";
import { NFTStorage, File } from "nft.storage";
import { baseSVG } from "./utils/BaseSVG";
import { ethers } from "ethers";
import moment from "moment";

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
const CONTRACT_ADDRESS = "0x935fb02F78B0dcC7C5D75BDFB9071f6CE60C5C91";// by dd
const ipfsBaseGate = "https://nftstorage.link/ipfs/";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [description,setDescription] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [selectEventID, setSelectEventID] = useState("");
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
            console.log(sender, " build a eventID=",eventId,",means:",selectEventID," nft for address: ",party,",hash is:  ",proposeHash);
            fetchNFTCollection();
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
      loading: "Saving NFT data to NFT.Storage...",
    });
    // console.log("tx state clear");

    const client = new NFTStorage({
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDhiNGFGRDdENTBiZDYxOEZlRjhhNDUzMThiYmMwMDk1YjdDMTc5RjEiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1MTgyNzE0Nzg1OCwibmFtZSI6InRleHR2ZXJzZS1wcmQifQ.nzqaau57VZE-n_RuK5wOV5gVeffDicK8EHrvSKoN7Uo"
    });
    // console.log(client)
    // console.log("client state ok");

    //image contains any File or Blob you want to save
    let connectionID = 1;
    connectionID = (selectEventID==='Citizenship') ? (connectionID=2) : (connectionID=1);
    // console.log("connectionID----you select ",connectionID);

    try {
      await client
        .store({
          name: `${name}`,
          description: `${description}`,
          attributes: [
            {"trait_type": "Issuer",
            "value": `${currentAccount}`
          },
          ],
          connectionID: `${connectionID}`,
          // "doubleIssuance":`${doubleIssuance}`,
          image: new File(
            [
              `${baseSVG}${name}</text></svg>`,
            ],
            `SoulTokens.svg`,
            {
              type: "image/svg+xml",
            }
          ),          
        })
        .then((metadata) => {
          console.log(metadata)
          setTransactionState({
            ...transactionState,
            success: "Saved NFT data to NFT.Storage...!! ",
            loading: "",
          });
          console.log("metadata saved", metadata);

          // createImageView(metadata);  //todo
          
          // const status = await client.status(metadata.ipnft);
          // console.log("status", status);

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
      loading: "Approving & minting NFT...",
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

        connectedContract.on(
          "MakePropose",
          (from, to,proposeHash, eventId) => {
            console.log(from, " build a eventID=",eventId,",means:",selectEventID," nft for address: ",to,",hash is:  ",proposeHash);
            setLinksObj({
              ...linksObj,
              opensea: `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${eventId.toNumber()}`,
              rarible: `https://rinkeby.rarible.com/token/${CONTRACT_ADDRESS}:${eventId.toNumber()}`,
              etherscan: `https://rinkeby.etherscan.io/tx/${nftTxn.hash}`,
            });
          }
        );

        //SHOULD UPDATE IMAGELINK to returned value
        await nftTxn.wait();
        setTransactionState({
          ...INITIAL_TRANSACTION_STATE,
          success: "NFT Minted!",
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
  }

  /* 
    Helper function for fetching the Filecoin data through IPFS gateways 
    to display the images in the UI 
  */
  const createImageURLsForRetrieval = async (collection) => {
    console.log("getImgUrl:",collection);
    let dataCollection = collection
    .slice()
    .reverse()
    .slice(0, 5)
    .map((el) => {
      return el;
    });

    let imgURLs = await Promise.all(
      dataCollection.map(async (el) => {
        const ipfsGatewayLink = createIPFSgatewayLink(el);
        // let link = el[1].split("/");
        // let fetchURL = `https://${link[2]}.ipfs.dweb.link/${link[3]}`;
        console.log("fetchURL", ipfsGatewayLink);
        const response = await fetch(ipfsGatewayLink, 
      //     {
      //     method : "GET",
      //     mode: 'cors',
      //     type: 'cors',
      //     headers: {}
      // }
      );
        const json = await response.json();
        // console.log("Responsejson", json)
        return json;
      })
    );

    console.log("imgURLs2", imgURLs);
    setRecentlyMinted(imgURLs);
  }

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

        const approvePropose = async(hash) => await connectedContract.approvePropose(hash);

        let pendingItems=[];
        for(var i=0;i<NFTsToMint.toNumber();i++){
          let proposeHash = await connectedContract.pendingConfirmByIndex(currentAccount,i);
          // console.log("pendingConfirmByIndex:",proposeHash);
          let porposeDetail =  await connectedContract.proposeInfo(proposeHash);
          // console.log("porposeDetail:",porposeDetail);
          let cttime = moment((porposeDetail["createAt"].toNumber())*1000).format("YYYY-MM-DD HH:mm:ss");
          let cftime = moment((porposeDetail["confirmAt"].toNumber())*1000).format("YYYY-MM-DD HH:mm:ss");
          let mMint = porposeDetail["mutualMint"] ? "true" : "false";
          let aStatus = porposeDetail["acceptStatus"] ? "true" : "false";
          pendingItems.push(<p key={i}>
            "Pending proposeHash:"
           <button  onClick={()=>approvePropose(proposeHash)}>Mint My Invitation</button>
          <br/>
          "Propose Issuer:":{porposeDetail["from"]}
          <br/>
          "Propose Receiver:":{porposeDetail["to"]}
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

            historyItems.push(<p key={index}>"Pending proposeHash:"{item}
            <br/>
            "Propose Issuer:":{hashPorposeDetail["from"]}
            <br/>
            "Propose Receiver:":{hashPorposeDetail["to"]}
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
            <br/> --------------------------------------------------------------------                                                        
            </p>);            
            // await createImageURLsForRetrieval(hashPorposeDetail);
          }) ;
          setCHistory(historyItems);
          setCreatedCount(createdCount);
          // console.log("cHistory:",cHistory);

        //await createImageURLsForRetrieval(hashPorposeDetail);


        // // console.log("Pending confirm nft's propose hash detail:",hashPorposeDetail);
        // let cidTemp = hashPorposeDetail[3].split('/')[2];
        // // console.log("pure cid: ",hashPorposeDetail[3].split('/')[2]);
        // let nameJson = hashPorposeDetail[3].split('/')[3];
        // // console.log("pure name: ",hashPorposeDetail[3].split('/')[3]);
        
        // let jsonMeta = await axios({method: 'get',url: `${ipfsBaseGate}${cidTemp}/${nameJson}`});
        // // console.log("tttt:",`${ipfsBaseGate}${cidTemp}/${nameJson}`);
        // let jsonData = {};
        // await axios({method: 'get',url: `${ipfsBaseGate}${cidTemp}/${nameJson}`}).then(response=>{
        //   // console.log("jsonMeta:", response.data);
        //   jsonData = response.data;
        // });
        // let nameNFT = jsonData.name;
        // let descriptionNFT = jsonData.description;
        // let external_url = jsonData.external_url;
        // let imageUrl = ipfsBaseGate + jsonData.image.split('/')[2] +'/'+jsonData.image.split('/')[3];
        // // console.log("imageUrl:",imageUrl);
        // let imageNFT = await  axios({method: 'get',url: `${jsonData.image}`});
        // // console.log("image:",imageNFT);
        //   // approve the specify eventID's hash, to mint for currentAccount, need click page to trigger
        // let approveHash = await connectedContract.approvePropose(hashPropose);
        
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
