import { useState, useEffect, Fragment } from 'react';

import Select from '@mui/material/Select';

import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { Link, useNavigate } from 'react-router-dom';
import {useParams, useLocation} from "react-router-dom";
import GetAppIcon from '@mui/icons-material/GetApp';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PaginatedLogsTable from "./components/PaginatedLogsTable";
import {getRelabelMap} from "./utilities"
import { useExperiment } from './providers/ExperimentContext';
import ManageExperimentMenu from "./components/ManageExperimentMenu";
import RecordEventLogDialog from './components/RecordEventLogDialog';

function Logs(props) {

  const location = useLocation();
  const {experimentMetadata} = useExperiment()
  const [relabelMap, setRelabelMap] = useState({})
  const [assignedUnits, setAssignedUnits] = useState([])
  const {unit} = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = props.title;
  }, [props.title])

  useEffect(() => {
    async function fetchWorkers(experiment) {
      try {
        const response = await fetch(`/api/experiments/${experiment}/historical_workers`);
        if (response.ok) {
          const units = await response.json();
          setAssignedUnits(units.map(u => u.pioreactor_unit));
        } else {
          console.error('Failed to fetch workers:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching workers:', error);
      }
    };

    if (experimentMetadata.experiment){
        getRelabelMap(setRelabelMap, experimentMetadata.experiment)
        fetchWorkers(experimentMetadata.experiment)
    }
  }, [experimentMetadata, location])

  const onSelectionChange = (event) => {
    // go to the selected units /log/<unit> page

    if (event.target.value === "_all"){
      navigate(`/logs/`);
    }
    else{
      navigate(`/logs/${event.target.value}`);
    }

  }

  const handleSubmitDialog = async (newLog) => {
    try {
      const response = await fetch(`/api/units/${newLog.pioreactor_unit}/experiments/${newLog.experiment}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
      if (!response.ok) {
        throw new Error('Failed to submit new log entry.');
      }
    } catch (error) {
      console.error('Error adding new log entry:', error);
    }
  };

  return (
    <Fragment>
      <Grid container spacing={2} >
        <Grid item xs={12} md={12}>

        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: "bold" }}>
              Detailed event logs for
              <Select
                labelId="configSelect"
                variant="standard"
                value={unit ? unit : "_all"}
                onChange={onSelectionChange}

                sx={{
                  "& .MuiSelect-select": {
                    paddingY: 0,
                  },
                  ml: 1,
                  fontWeight: "bold", // Matches the title font weight
                  fontSize: "inherit", // Inherits the Typography's font size
                  fontFamily: "inherit", // Inherits the Typography's font family
                }}
              >
                {assignedUnits.map((unit) => (
                  <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                ))}
                <MenuItem key="_all" value="_all">&lt;All assigned Pioreactors&gt;</MenuItem>
              </Select>
            </Typography>
            <Box sx={{display: "flex", flexDirection: "row", justifyContent: "flex-start", flexFlow: "wrap"}}>
              <RecordEventLogDialog
                defaultPioreactor={unit || ''}
                defaultExperiment={experimentMetadata.experiment}
                availableUnits={assignedUnits}
                onSubmit={handleSubmitDialog}
              />
              <Button to={`/export-data`} component={Link} style={{textTransform: 'none', marginRight: "0px", float: "right"}} color="primary">
                <GetAppIcon fontSize="15" sx={{verticalAlign: "middle", margin: "0px 3px"}}/> Export logs
              </Button>
              <Divider orientation="vertical" flexItem variant="middle"/>
              <ManageExperimentMenu experiment={experimentMetadata.experiment}/>
            </Box>
          </Box>
        </Box>

          <PaginatedLogsTable unit={unit} experiment={experimentMetadata.experiment} relabelMap={relabelMap}/>
        </Grid>

      </Grid>
    </Fragment>
  );
}
export default Logs;
