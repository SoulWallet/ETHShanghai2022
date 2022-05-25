import React from "react";
import nftHackLogo from "../assets/nfthack-logo.png";

const Header = () => {
  return (
    <>
      <a
        href="https://github.com/jhfnetboy/"
        target="_blank"
        rel="noreferrer"
      >
        <img
          alt="ETH Shanghai 2022 NFTHack Logo"
          style={{ height: "200px" }}
          src={nftHackLogo}
        ></img>
      </a>
      <p className="header gradient-text">Soul Bound NFTs Collection</p>
      <p className="sub-text">
        Limited NFTs for SBTs to mint
      </p>
    </>
  );
};

export default Header;
