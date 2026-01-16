import * as React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
// import ProfileCard from './Profile';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 0, width: "100%", height: "100%", ml: 2 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

interface TabProps {
  switchMode: () => void
}

export default function VerticalTabs(props: TabProps) {
  const [value, setValue] = React.useState(0);
  const { switchMode } = props;
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: 400 }}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        sx={{ borderRight: 1, borderColor: 'divider', maxWidth: 150,  }}
      >
        <Tab sx={{alignItems: "flex-start", textAlign: "left", '&.Mui-selected': { backgroundColor: 'rgba(0, 107, 214, 1)', color: 'white', },}} label="Item One" />
        <Tab sx={{alignItems: "flex-start", textAlign: "left", '&.Mui-selected': { backgroundColor: 'rgba(0, 107, 214, 1)', color: 'white', },}} label="Item Two"  />
        <Tab sx={{alignItems: "flex-start", textAlign: "left", '&.Mui-selected': { backgroundColor: 'rgba(0, 107, 214, 1)', color: 'white', },}} label="Item Three" />
        <Tab sx={{alignItems: "flex-start", textAlign: "left", '&.Mui-selected': { backgroundColor: 'rgba(0, 107, 214, 1)', color: 'white', },}} label="Item Four" />
        <Tab sx={{alignItems: "flex-start", textAlign: "left", '&.Mui-selected': { backgroundColor: 'rgba(0, 107, 214, 1)', color: 'white', },}} label="Item Five" />
        <Tab sx={{alignItems: "flex-start", textAlign: "left", '&.Mui-selected': { backgroundColor: 'rgba(0, 107, 214, 1)', color: 'white', },}} label="Item Six" />
        <Tab onClick={switchMode} sx={{alignItems: "flex-start", textAlign: "left", '&.Mui-selected': { backgroundColor: 'rgba(0, 107, 214, 1)', color: 'white', },}} label="Item Seven" />
      </Tabs>

      <TabPanel value={0} index={0} >
        <Box sx={{position: "relative", width: "1100px", height: "400px", p: 0, m: 0}}>
          {/* <ProfileCard /> */}
        </Box>
      </TabPanel> 
    </Box>
  );
}