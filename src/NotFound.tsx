import { Box, Typography } from "@mui/material";
import "./NotFound.css";
import { Link } from 'react-router-dom';


const NotFound = () => {
  return (
    <Box sx={{ backgroundColor: "#fff" }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h1" fontWeight={"300"} fontSize={87}>404</Typography>
      </Box>
      <div className="four_zero_four_bg"></div>
      <Box>
        <div className="contant_box_404">
          <Typography variant="h3" fontWeight={"300"}>
            Look like you're lost
          </Typography>
          {/* <Typography variant="body2">the page you are looking for not avaible!</Typography> */}
          <Link to="/" className="link_404">Go to Home</Link>
        </div>
      </Box>
    </Box>

  )
}

export default NotFound;