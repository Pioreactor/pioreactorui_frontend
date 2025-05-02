import React, { useState } from "react";
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import HLSVideoPlayer from "./components/HLSVideoPlayer"; // Import your HLSVideoPlayer component

function WebcamContainer() {
  // State to store stream URLs for two video players
  const [streamUrl1, setStreamUrl1] = useState("data/webcam.m3u8");
  const [streamUrl2, setStreamUrl2] = useState("data/webcam.m3u8");

  // Function to handle stream URL change for video player 1
  const handleUrlChange1 = (e) => {
    setStreamUrl1(e.target.value);
  };

  // Function to handle stream URL change for video player 2
  const handleUrlChange2 = (e) => {
    setStreamUrl2(e.target.value);
  };

  return (
    <React.Fragment>
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="h5" component="h2">
            <Box fontWeight="fontWeightBold">
              Webcams
            </Box>
          </Typography>
        </Box>





      </Box>

      {/* Grid layout to display two video players side by side */}
      <Grid container spacing={2}>
        <Grid item md={6} xs={12}>
          <Card>
            <CardContent sx={{ p: 1 }}>
            {/* Input for stream URL 1 */}
        <TextField
          label="Enter Stream URL 1"
          variant="outlined"
          fullWidth
          value={streamUrl1}
          onChange={handleUrlChange1}
          sx={{ marginBottom: 2 }}
        />
              {/* First Video Player */}
              <HLSVideoPlayer streamUrl={streamUrl1} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item md={6} xs={12}>
          <Card>
            <CardContent sx={{ p: 1 }}>
            {/* Input for stream URL 2 */}
        <TextField
          label="Enter Stream URL 2"
          variant="outlined"
          fullWidth
          value={streamUrl2}
          onChange={handleUrlChange2}
          sx={{ marginBottom: 2 }}
        />
              {/* Second Video Player */}
              <HLSVideoPlayer streamUrl={streamUrl2} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

function Webcam(props) {
  React.useEffect(() => {
    document.title = props.title;
  }, [props.title]);

  return (
    <Grid container spacing={2}>
      <Grid item md={12} xs={12}>
        <WebcamContainer />
      </Grid>
    </Grid>
  );
}

export default Webcam;
