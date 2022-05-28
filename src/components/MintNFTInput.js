import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';


const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
});



const MintNFTInput = ({...props}) => {
    // console.log("mintuiprops", props);
    const classes = useStyles();
    const [value, setValue] = React.useState(0);
    
    const handleChange = (event, newValue) => {
      setValue(newValue);
    };

    let {name, setName, receiverAddress, setReceiverAddress, selectEventID, setSelectEventID, transactionState, createNFTData} = props;
    return (
    <div>
    <hr/>

<Paper className={classes.root}>
  <Tabs
    value={value}
    onChange={handleChange}
    indicatorColor="primary"
    textColor="primary"
    centered
  >
    <Tab label="Item One" />
    <Tab label="Item Two" />
    <Tab label="Item Three" />
  </Tabs>
</Paper>

{/* content */}
     
        <p>  <br />
        <a className="sub-text gradient-text"> Build a Soul Bound Realtions:</a> <br />       
          <select
          className="input"
          placeholder="Select Type"
          onChange={(e) => console.log(e.target.value)}
          >
            <option>Marriage
            </option>
            <option>Citizenship
            </option> 
          </select>&nsp
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
{/* content */}





      </div>
    )
};

export default MintNFTInput;
