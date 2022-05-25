import React, { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ETHShanghaiLogo from "../assets/ETHShanghaiLogo.png";

const Layout = (props) => {
  return (
    <div className="App">
      <div className="container">
        <div className="header-menu-container">
          <a href="https://www.ethshanghai.org/zh" target="_blank" rel="noreferrer">
            <img
              alt="ETH Shanghai Logo"
              style={{ height: "50px" }}
              src={ETHShanghaiLogo}
            />
          </a>
          <button
            onClick={props.connectWallet}
            className={
              props.connected
                ? "cta-button connect-to-wallet-button"
                : "cta-button connect-wallet-button"
            }
          >
            {props.connected ? "Connect to Wallet" : "Connected"}
          </button>
        </div>
        <div className="header-container">
          <Header />
          {props.children}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
