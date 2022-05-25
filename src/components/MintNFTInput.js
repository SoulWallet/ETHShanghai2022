import React from "react";

const MintNFTInput = ({...props}) => {
    console.log("mintuiprops", props)
    let {name, setName, list, setList, transactionState, createNFTData} = props;
    return (
    <div>
        <p>
          <input
            className="input"
            placeholder="Enter your name"
            type="text"
            // pattern="[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{1,63}$"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          /><br/><br/>
          <input
            className="input"
            placeholder="Enter your address list"
            type="text"
            // pattern="[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{1,63}$"
            required
            value={list}
            onChange={(e) => setList(e.target.value)}
          />          
        </p>
        <button
          onClick={createNFTData}
          className={
            name
              ? "cta-button connect-wallet-button"
              : "cta-button connect-wallet-button-disabled"
          }
          disabled={!name || transactionState.loading}
        >
          Mint NFT
        </button>
      </div>
    )
};

export default MintNFTInput;
