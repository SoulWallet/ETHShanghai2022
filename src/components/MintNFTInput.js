import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}
TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));


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
    {/* tab begin  */}

    <div className={classes.root}>
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
          <Tab label="Item One" {...a11yProps(0)} />
          <Tab label="Item Two" {...a11yProps(1)} />
          <Tab label="Item Three" {...a11yProps(2)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        Item One
      </TabPanel>
      <TabPanel value={value} index={1}>
        Item Two
      </TabPanel>
      <TabPanel value={value} index={2}>
        Item Three
      </TabPanel>
    </div>

    {/* tab end */}

{/* content begin */}
     
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
{/* content end*/}





      </div>
    )
};

export default MintNFTInput;
