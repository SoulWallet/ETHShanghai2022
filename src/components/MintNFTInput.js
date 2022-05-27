import React from "react";

const MintNFTInput = ({...props}) => {
    console.log("mintuiprops", props)
    let {name, setName, receiverAddress, setReceiverAddress, selectEventID, setSelectEventID, transactionState, createNFTData} = props;
    return (
    <div>
        <p>
          <input
            className="input"
            placeholder="Enter Soul Token Name"
            type="text"
            // pattern="[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{1,63}$"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />&nsp
          <input
            className="input"
            placeholder="Enter receiver address "
            type="text"
            // pattern="[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{1,63}$"
            required
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
          /><br /> <br />
          <select
          className="input"
          placeholder="Select Type"
          onChange={(e) => console.log(e.target.value)}
          >
            <option>Marriage
            </option>
            <option>Citizenship
            </option> 
          </select>


          {/* _party (address), _eventId (uint256), _mutualMint (bool), _tokenURI (string) */}

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
