const main = async () => {
    const nftContractFactory = await hre.ethers.getContractFactory(
      "SoulToken"
    );
    // 0x91D5F7696CdAf23e1B74dE75FC4de605178c05Cc
    // deployed on rinkeby 5-26
    const nftContract = await nftContractFactory.deploy(0);
    await nftContract.deployed();
    console.log("Contract deployed to:", nftContract.address);
  
    // Call the function.
    // let txn = await nftContract.mintMyNFT(
    //   "ipfs://bafyreiah6nfc5ht2rifpnwuqssq6mkxhtjurrrcgnn7ms42d755edt7nqy/metadata.json"
    //   // "https://bafybeiggaxhjtplbrn26mox5npfd7rif3wt43h4oy55q5wfzyonmmrcqty.ipfs.dweb.link/nft.json"
    // );
    // // Wait for it to be mined.
    // await txn.wait();
  };
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();

  // npx hardhat run scripts/SoulToken-deploy.js --network rinkeby 
  