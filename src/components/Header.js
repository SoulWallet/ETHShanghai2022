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
          style={{ height: "150px" }}
          src={nftHackLogo}
        ></img>
      </a>
      <p className="header gradient-text">Welcome to Proof of Soul! </p>
      <p className="sub-text">
PoS is a permissionliss soul bound token issue/mint protocol. <br/>
You’re welcome to issue souldbound Token to your lover, friends and community to show your love!
      </p>
    </>
  );
};

export default Header;
