import React, { useState, useEffect } from "react";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Snackbar from "@mui/material/Snackbar";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {runPioreactorJob} from "../utilities"

import PioreactorIcon from "./PioreactorIcon"
import DosingAutomationForm from "./DosingAutomationForm"



function ChangeDosingAutomationsDialog(props) {
  const automationType = "dosing"
  const [automationName, setAutomationName] = useState("chemostat")
  const [algoSettings, setAlgoSettings] = useState({
    skip_first_run: 0,
    max_volume_ml: props.maxVolume,
    initial_liquid_volume_ml: props.liquidVolume,
  })
  const [automations, setAutomations] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    function fetchAutomations() {
      fetch("/api/contrib/automations/" + automationType)
        .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Something went wrong');
            }
          })
        .then((listOfAuto) => {
          setIsLoading(false)
          setAutomations(Object.assign({}, ...listOfAuto.map(auto => ({ [auto.automation_name]: auto}))))
        })
        .catch((error) => {})
    }
    fetchAutomations();
  }, [automationType])


  const removeEmpty = (obj) => {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
  }


  const handleClose = () => {
    props.onFinished();
  };

  const handleSkipFirstRunChange = (e) => {
    setAlgoSettings({...algoSettings, skip_first_run: e.target.checked ? 1 : 0})
  }

  const handleAlgoSelectionChange = (e) => {
    const newAlgoName = e.target.value;
    setAutomationName(newAlgoName);

    setAlgoSettings((prev) => ({
      ...( !props.no_skip_first_run && { skip_first_run: prev.skip_first_run }),
      max_volume_ml: prev.maxVolume,
      initial_liquid_volume_ml: prev.liquidVolume,
    }));
  };

  const updateFromChild = (setting) => {
    setAlgoSettings(prevState => ({...prevState, ...setting}))
  }

  const startJob = (event) => {
    event.preventDefault()
    runPioreactorJob(props.unit, props.experiment, `${automationType}_automation`, [], {"automation_name": automationName, ...removeEmpty(algoSettings)})
    setOpenSnackbar(true);
    handleClose()
  }

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  return (
    <React.Fragment>
    <Dialog open={props.open} onClose={handleClose} aria-labelledby="form-dialog-title" PaperProps={{style: {height: "100%"}}}>
      <DialogTitle>
        <Typography sx={{fontSize: "13px", color: "rgba(0, 0, 0, 0.60)"}}>
          <PioreactorIcon style={{verticalAlign: "middle", fontSize: "1.2em"}}/>
            {(props.unit === "$broadcast")
              ? <b>All active and assigned Pioreactors</b>
              :((props.title || props.label)
                  ? ` ${props.label} / ${props.unit}`
                  : `${props.unit}`
              )
            }
        </Typography>
        <Typography sx={{fontSize: 20, color: "rgba(0, 0, 0, 0.87)"}}>
          Select {automationType} automation
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
          size="large">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" component="span" gutterBottom>
          <span style={{textTransform: "capitalize"}}>{automationType}</span> automations control the {automationType} in the Pioreactor's vial. Learn more about <a target="_blank" rel="noopener noreferrer" href={"https://docs.pioreactor.com/user-guide/" + automationType + "-automations"}>{automationType} automations</a>.
        </Typography>

        {!isLoading && <form>
          <FormControl component="fieldset" sx={{mt: 2}}>
          <FormLabel component="legend">Automation</FormLabel>
            <Select
              variant="standard"
              value={automationName}
              onChange={handleAlgoSelectionChange}
              style={{maxWidth: "270px"}}
            >
              {Object.keys(automations).map((key) => <MenuItem id={key} value={key} key={"change-io" + key}>{automations[key].display_name}</MenuItem>)}

            </Select>
            {Object.keys(automations).length > 0 &&
              <DosingAutomationForm
                fields={automations[automationName].fields}
                description={automations[automationName].description}
                updateParent={updateFromChild}
                name={automationName}
                maxVolume={props.maxVolume}
                liquidVolume={props.liquidVolume}
                threshold={props.threshold}
                />

            }

            <Box sx={{mt: 1}}>
              <FormControlLabel
                control={<Checkbox checked={Boolean(algoSettings.skip_first_run)}
                                    color="primary"
                                    onChange={handleSkipFirstRunChange}
                                    size="small"/>
                        }
                label="Skip first run"
                sx={{mr: 0, mt: 0}}
              />
              <IconButton target="_blank" rel="noopener noreferrer" href="https://docs.pioreactor.com/user-guide/intro-to-automations#skip-first-run">
                <HelpOutlineIcon sx={{ fontSize: 17, verticalAlign: "middle", ml: 0 }}/>
              </IconButton>
            </Box>

          </FormControl>
        </form>}
        {isLoading && <p>Loading...</p>}
      </DialogContent>
      <DialogActions>
        <Button
          color="secondary"
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={startJob}
          disabled={isLoading}
        >
          Start
        </Button>
      </DialogActions>
    </Dialog>
    <Snackbar
      anchorOrigin={{vertical: "bottom", horizontal: "center"}}
      open={openSnackbar}
      onClose={handleSnackbarClose}
      message={`Starting ${automationType} automation ${automations[automationName]?.display_name}.`}
      autoHideDuration={7000}
      key={"snackbar-change-" + automationType}
    />
    </React.Fragment>
  );}


export default ChangeDosingAutomationsDialog;
