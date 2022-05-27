import React, { useState, useEffect } from "react";
import axios from "axios";
/* ERC71 based Solidity Contract Interface */
// import SBTsHack from "./utils/SBTsHack.json";
import SoulToken from "./utils/SoulToken.json";

/* NFT.Storage import for creating an IPFS CID & storing with Filecoin */
import { NFTStorage, File } from "nft.storage";
import { baseSVG } from "./utils/BaseSVG";

/* Javascript Lib for evm-compatible blockchain contracts */
import { ethers } from "ethers";

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

// const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
// set constant contract address cause of server in fleek has no .env
const CONTRACT_ADDRESS = "0x0965EEAB6a3c19F309CB4450226eCE8D3AfADe1A";// by dd
const ipfsBaseGate = "https://nftstorage.link/ipfs/";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [selectEventID, setSelectEventID] = useState("");
  
  const [NFTsToMint, getNFTsToMint] = useState("");
  // banlanceOf?  owner? OwnerOf?? pendingConfirmCount(addr)
  const [linksObj, setLinksObj] = useState(INITIAL_LINK_STATE);
  const [imageView, setImageView] = useState("");
  const [remainingNFTs, setRemainingNFTs] = useState("");
  const [nftCollectionData, setNftCollectionData] = useState("");
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
    setSelectEventID(0);
    fetchNFTCollection();
  }, [currentAccount]);

  /* Check for a wallet */
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
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
      console.log("Connected", accounts[0]);
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
        
        // get currentAccount the number of NFT to mint
        let countByAddr = await connectedContract.pendingConfirmCount(currentAccount);
        console.log("countByAddr:",countByAddr.toNumber());
        setRemainingNFTs(countByAddr.toNumber());
        //get the hash of specify eventID(marriage:0, alliance:1, etc) that to be approved
        let hashByEventID = await connectedContract.pendingConfirmByIndex(currentAccount, selectEventID);
        console.log("hashByEventID:",hashByEventID);

        // get hash's propose detail
        // proposeInfo[proposeHash] = Propose(ss,dd,dd,dd,dd,dd)
        let hashPorposeDetail = await connectedContract.proposeInfo(hashByEventID);
        // console.log("Pending confirm nft's propose hash detail:",hashPorposeDetail);
        console.log("pure cid: ",hashPorposeDetail[3].split('/')[2]);
        let cidTemp = hashPorposeDetail[3].split('/')[2];

        console.log("pure name: ",hashPorposeDetail[3].split('/')[3]);
        let nameJson = hashPorposeDetail[3].split('/')[3];
        let jsonMeta = await axios({method: 'get',url: `${ipfsBaseGate}${cidTemp}/${nameJson}`});
        console.log("tttt:",`${ipfsBaseGate}${cidTemp}/${nameJson}`);
        await axios({method: 'get',url: `${ipfsBaseGate}${cidTemp}/${nameJson}`}).then(response=>{
          console.log("jsonMeta:", response.data);
        });
        // let nameNFT = response.data.name;
        // let descriptionNFT = response.data.description;
        // let external_url = response.data.external_url;
        // let imageUrl = ipfsBaseGate + response.data.image.split('/')[2] +'/'+response.data.image.split('/')[3];
        // console.log("imageUrl:",imageUrl);
        // let imageNFT = await  axios({method: 'get',url: `${response.data.image}`});
        // console.log("image:",imageNFT);

        


        //approve the specify eventID's hash, to mint for currentAccount, need click page to trigger
        // let approveHash = await connectedContract.approvePropose(hashByEventID);

        // const client = new NFTStorage({
        //   // token: process.env.REACT_APP_NFT_STORAGE_API_KEY,
        //   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDhiNGFGRDdENTBiZDYxOEZlRjhhNDUzMThiYmMwMDk1YjdDMTc5RjEiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1MTgyNzE0Nzg1OCwibmFtZSI6InRleHR2ZXJzZS1wcmQifQ.nzqaau57VZE-n_RuK5wOV5gVeffDicK8EHrvSKoN7Uo"
        // });
        // console.log(client);
        // console.log("client state ok in read");
        // try {
        //   await client
        //     .get("bafyreidboe37vrnxpqrr47i4ja5e7e2uljhofp3uosifltdjrrvfm7dxgy")
        //     .then((metadata) => {
        //       console.log("ipfs read content",metadata)
        //       // do something
        //     });
        // } catch (error) {
        //   console.log(error)
        //   console.log("Could not save NFT to NFT.Storage - Aborted read");
        // }
        
       
        connectedContract.on(
          "MakePropose",
          (sender, party, proposeHash, eventId) => {
            console.log(sender, " build a eventID=",eventId," nft for address: ",party,",hash is:  ",proposeHash);
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
    console.log("saving to NFT storage...");
    resetState();
    console.log("clear state...");
    setTransactionState({
      ...INITIAL_TRANSACTION_STATE,
      loading: "Saving NFT data to NFT.Storage...",
    });
    console.log("tx state clear");

    // install it
    // Set Up the NFT.Storage Client
    const client = new NFTStorage({
      // token: process.env.REACT_APP_NFT_STORAGE_API_KEY,
      // token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDhiNGFGRDdENTBiZDYxOEZlRjhhNDUzMThiYmMwMDk1YjdDMTc5RjEiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1MTgxOTQ0NzgzOCwibmFtZSI6InRleHR2ZXJzZS10ZXh0In0.V2Qb3z5JIT9dqvksafgTFfVTV92Yx0upcODojhgMHKc",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDhiNGFGRDdENTBiZDYxOEZlRjhhNDUzMThiYmMwMDk1YjdDMTc5RjEiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1MTgyNzE0Nzg1OCwibmFtZSI6InRleHR2ZXJzZS1wcmQifQ.nzqaau57VZE-n_RuK5wOV5gVeffDicK8EHrvSKoN7Uo"
    });
    console.log(client)
    console.log("client state ok");

    //lets load up this token with some metadata and our image and save it to NFT.storage
    //image contains any File or Blob you want to save
    //name, image, description, other traits.
    // useBlob to save one item to IPFS
    // use File to save all the json metadata needed - much like any object storage you're familiar with!
    try {
      await client
        .store({
          name: `${name}: Soul token for friendship @ ETH Shanghai Hackthon 2022`,
          description: "Soul token sample. jhfnetboy",
          external_url: "https://soul-token.io/3",
          // image: "ipfs://bafybeicnnzqiizbwz5c5kger2tzedc7g4q5tj6onqennicwhjni6mk3bym"
          image: new File(
            [
              `${baseSVG}${name}</text>
      </svg>`,
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

          // To view the data we just saved in the browser we need to use an IPFS http bridge
          // Or Brave Browser which has IPFS integration built into it
          // Or run a local IPFS node (there's a desktop app)
          // This means manipulating the returned CID to configure it for a gateway...
          // Check gateways & their functionality here: https://ipfs.github.io/public-gateway-checker/

          // createImageView(metadata);
          
          //we can also check the status of our data using this
          // const status = await client.status(metadata.ipnft);
          // console.log("status", status);

          // Now that we have a CID and our data is stored on Filecoin, 
          // - we'll mint the NFT with the token data (and IPFS CID)
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

  /* Mint the NFT on the eth blockchain */
  const askContractToMintNft = async (IPFSurl) => {
    console.log("herer enter askContractToMintNft")
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
        let nftTxn = await connectedContract.sendRequest(receiverAddress, 1, true, IPFSurl);
            // ) ipfs://bafkreidgmyqs42h27e3k6ojws4rjufmcpw5erhlyxvy2buuedvtppngs24

        connectedContract.on(
          "MakePropose",
          (from, to,proposeHash, eventId) => {
            console.log(from, " build a eventID=",eventId," nft for address: ",to,",hash is:  ",proposeHash);
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
    let link = el[1].split("/");
    let fetchURL = `https://${link[2]}.ipfs.dweb.link/${link[3]}`;
    return fetchURL;
  }

  /* 
    Helper function for fetching the Filecoin data through IPFS gateways 
    to display the images in the UI 
  */
  const createImageURLsForRetrieval = async (collection) => {
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
    console.log("fetching nft collection");
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

        let remainingNFTs = await connectedContract.pendingConfirmCount(currentAccount);
        setRemainingNFTs(remainingNFTs.toNumber()); //update state


        /// @notice mapping propose Id to propose detail
        // mapping(bytes32 => Propose) public proposeInfo;
        /// @notice get list of propose Ids created By address
        // mapping(address => bytes32[]) public proposeIdByAddr;
         

        // get currentAccount's propose
        // proposeIdByAddr[msg.sender].push(proposeHash);
        let currentPropose = await connectedContract.proposeIdByAddr(currentAccount, selectEventID);
        console.log("Propose I have:",currentPropose)

        // get hash's propose detail
        // proposeInfo[proposeHash] = Propose(ss,dd,dd,dd,dd,dd)
        let hashPorposeDetail = await connectedContract.proposeInfo(currentPropose);
        console.log("Specify propose hash detail:",hashPorposeDetail);
        

     // struct myNFT {
      //     address owner;
      //     string tokenURI;
      //     uint256 tokenId;
      // }
      // collection = myNFT[]
        let collection = currentPropose;
        setNftCollectionData(collection); //update state
        console.log("collection", collection);

      //   struct Propose {
      //     address from;
      //     address to;
      //     uint256 eventId;
      //     string tokenURI;
      //     bool acceptStatus;
      //     bool mutualMint;
      // }

        /***
         * Going to put these in the view collection
         */
        // await createImageURLsForRetrieval(collection);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };


  /* Render our page */
  return (
    <Layout connected={currentAccount === ""} connectWallet={connectWallet}>
      <>
        <p className="sub-sub-text">{`Received Soul Bound Tokens: `}</p>
        {/* <p className="sub-sub-text">{`Received Soul Bound Tokens: ${remainingNFTs}`}</p> */}
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
          <MintNFTInput name={name} setName={setName} selectEventID={selectEventID} setSelectEventID={setSelectEventID} receiverAddress={receiverAddress} setReceiverAddress={setReceiverAddress} transactionState={transactionState} createNFTData={createNFTData}/>
        )}
        {recentlyMinted && <NFTViewer recentlyMinted={recentlyMinted}/>}
      </>
    </Layout>
  );
};

export default App;
