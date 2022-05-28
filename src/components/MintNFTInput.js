import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';

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
  // console.log("click index:", index);
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
    const [checked, setChecked] = React.useState(true);
    const [selectDI, setSelectDI] = React.useState(true);
    const handleChange2 = (event) => {
      setChecked(event.target.checked);
      event.target.checked ? setSelectDI(true) : setSelectDI(false);
      console.log("checked:",event.target.checked)

    };

    let {name, setName, currentAccount, NFTsToMint, receiverAddress, setReceiverAddress, selectEventID, setSelectEventID, transactionState, createNFTData} = props;
    return (
    <div>
    <hr/>
    {/* tab begin  */}

    <div className={classes.root}>
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange} aria-label="simple tabs example" centered>
          <Tab label="Creation History" {...a11yProps(0)} />
          <Tab label="Attestion Invitation" {...a11yProps(1)} />
          <Tab label="Create new Soul Token" {...a11yProps(2)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        {/* history begin */}

        {/* history end */}
      </TabPanel>
      <TabPanel value={value} index={1}>
      {`Soul Bound Tokens to be Mint: ${NFTsToMint}`}
      </TabPanel>
      <TabPanel value={value} index={2}>



        {/* content begin */}
     
       
        {/* input area begin */}

        <Box bgcolor="info.main">
        <br /> <br />
        {/* <a className="sub-text gradient-text"> Build a Soul Bound Realtions:</a> <br />        */}
          <select
          className="input"
          placeholder="Select Type"
          onChange={(e) => console.log(e.target.value)}
          >
            <option>Marriage
            </option>
            <option>Citizenship
            </option> 
          </select> &nbsp;
          <Checkbox
        defaultChecked
        color="primary"
        onChange={(e) => handleChange2(e)}
        inputProps={{ 'aria-label': 'secondary checkbox' }}
      /> <label>doubleIssuance</label>
          <br /> <br />
          <input
            className="input"
            placeholder="Enter Soul Token Name"
            color="secondary"
            type="text"
            // pattern="[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{1,63}$"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />  &nbsp;
          <input
            className="input"
            placeholder="Enter receiver address "
            type="text"
            // pattern="[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{1,63}$"
            required
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
          /><br /> <br />
          <input
            className="input"
            placeholder="Enter description"
            color="secondary"
            type="text"
            // pattern="[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{1,63}$"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />  &nbsp;
      <input
            className="input"
            placeholder="Issuer"
            color="secondary"
            type="text"
            // pattern="[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{1,63}$"
            required
            disabled="disabled"
            value={currentAccount}
            onChange={(e) => setName(e.target.value)}
          />  &nbsp;
          <br /> <br />
          {/* _party (address), _eventId (uint256), _mutualMint (bool), _tokenURI (string) */}
          {/* input area end */}
        
        <button
          onClick={createNFTData}
          className={
            name
              ? "cta-button connect-wallet-button"
              : "cta-button connect-wallet-button-disabled"
          }
          disabled={!name || transactionState.loading}
        >
          Create Realtion Propose
        </button>
        </Box>
      {/* content end*/}
      </TabPanel>
    </div>

    {/* tab end */}

      </div>
    )
};

export default MintNFTInput;
