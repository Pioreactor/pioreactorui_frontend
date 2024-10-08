import React from "react";
import dayjs from "dayjs";

import Grid from '@mui/material/Grid';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import {Typography} from '@mui/material';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';
import LoadingButton from "@mui/lab/LoadingButton";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useSearchParams } from "react-router-dom";


const datasetDescription = {
    marginLeft: "30px",
    fontSize: 14
  }



function ExperimentSelection(props) {

  const [experiments, setExperiments] = React.useState([{experiment: "<All experiments>"}])

  React.useEffect(() => {
    let ignore = false;

    async function getData() {
       await fetch("/api/experiments")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (ignore){
          return
        }
        setExperiments(prevState => [ ...data, ...prevState])
        if (props.experimentSelection === "") {
          props.handleChange(data[0].experiment)
        }
        else if (data.filter(e => e.experiment === props.experimentSelection).length === 0) {
          props.handleChange(data[0].experiment)
        }
      });
    }
    getData()
    return () => {
      ignore = true;
    };
  }, [])

  const handleExperimentSelectionChange = (e) => {
    props.handleChange(e.target.value)
  }
  return (
    <Box sx={{maxWidth: "450px", m: 1}}>
      <FormControl fullWidth component="fieldset" >
        <FormLabel component="legend">Experiment</FormLabel>
        <Select
          labelId="expSelect"
          variant="standard"
          value={props.experimentSelection}
          onChange={handleExperimentSelectionChange}
        >
          {experiments.map((v) => {
            return <MenuItem key={v.experiment} value={v.experiment}>{v.experiment +  (v.created_at ? ` (started ${dayjs(v.created_at).format("MMMM D, YYYY")})` : "")}</MenuItem>
            }
          )}
        </Select>
      </FormControl>
    </Box>
  )
}

const PartitionByUnitSelection = (props) => {
  return (
    <Box sx={{m: 1, mt: 2}}>
      <FormControl component="fieldset" >
      <FormLabel component="legend">Partitions</FormLabel>
        <Box sx={{p: 1}}>
          <FormControlLabel
            control={<Checkbox checked={props.partitionByUnitSelection} onChange={props.handleChange} name="partition_by_unit" />}
            label="Partition csv files by Pioreactor unit?"
          />
        </Box>
      </FormControl>
    </Box>
)}



const CheckboxesGroup = (props) => {

  return (
    <Box sx={{m: 1}}>
      <FormControl component="fieldset" >
        <FormLabel component="legend">Available datasets</FormLabel>
        <FormGroup>
          <Box sx={{p: 1}}>
            <FormControlLabel
              control={<Checkbox checked={props.isChecked.pioreactor_unit_activity_data} onChange={props.handleChange} name="pioreactor_unit_activity_data" />}
              label="Pioreactor unit activity data (recommended)"
            />
            <Typography sx={datasetDescription} gutterBottom>
              This dataset contains most of your experiment data, including the time series of OD metrics, temperature, stirring rates, LED updates, and dosings.
            </Typography>
          </Box>



          <Box sx={{p: 1}}>
            <FormControlLabel
            control={<Checkbox checked={props.isChecked.logs} onChange={props.handleChange} name="logs" />}
            label="Pioreactor logs"
            />
            <Typography  sx={datasetDescription} gutterBottom>
              This dataset includes the append-only collection of logs from all Pioreactors. A subset of the these logs are displayed in the Log Table in the Experiment Overview.
              These are the logs that should be provided to get assistance when troubleshooting, but choose "&lt;All experiments&gt;" above.
            </Typography>
          </Box>

          <Box sx={{p: 1}}>
            <FormControlLabel
              control={<Checkbox checked={props.isChecked.growth_rates} onChange={props.handleChange} name="growth_rates" />}
              label="Implied growth rate"
            />
            <Typography sx={datasetDescription} gutterBottom>
             This dataset includes a time series of the calculated (implied) growth rate. This data matches what's presented in the "Implied growth rate" chart in the Experiment Overview.
            </Typography>
          </Box>

          <Box sx={{p: 1}}>
            <FormControlLabel
              control={<Checkbox checked={props.isChecked.od_readings} onChange={props.handleChange} name="od_readings" />}
              label="Optical density"
            />
            <Typography  sx={datasetDescription} gutterBottom>
              This dataset includes a time series of readings provided by the sensors (transformed via a calibration curve, if available), the inputs for growth calculations and normalized optical densities. This data matches what's presented in the "Optical density" chart in the Experiment Overview.
            </Typography>
          </Box>

          <Box sx={{p: 1}}>
            <FormControlLabel
            control={<Checkbox checked={props.isChecked.od_readings_filtered} onChange={props.handleChange} name="od_readings_filtered" />}
            label="Normalized optical density"
          />
            <Typography  sx={datasetDescription} gutterBottom>
              This dataset includes a time series of normalized optical densities. This data matches what's presented in the "Normalized optical density" chart in the Experiment Overview.
            </Typography>
          </Box>
          <Box sx={{p: 1}}>
            <FormControlLabel
            control={<Checkbox checked={props.isChecked.temperature_readings} onChange={props.handleChange} name="temperature_readings" />}
            label="Temperature readings"
            />
            <Typography  sx={datasetDescription} gutterBottom>
              This dataset includes a time series of temperature readings from the Pioreactors. This data matches what's presented in the "Temperature of vials" chart in the Experiment Overview.
            </Typography>
          </Box>

          <Box sx={{p: 1}}>
            <FormControlLabel
            control={<Checkbox checked={props.isChecked.experiments} onChange={props.handleChange} name="experiments" />}
            label="Experiment metadata"
            />
            <Typography  sx={datasetDescription} gutterBottom>
              This dataset includes your experiment description and metadata.
            </Typography>
          </Box>

          <Box sx={{p: 1}}>
            <FormControlLabel
            control={<Checkbox checked={props.isChecked.alt_media_fractions} onChange={props.handleChange} name="alt_media_fractions" />}
            label="Alternative media fraction"
            />
            <Typography  sx={datasetDescription} gutterBottom>
              This dataset includes a time series of how much alternative media is in each Pioreactor. This data matches what's presented in the "Fraction of volume that is alternative media" chart in the Experiment Overview.
            </Typography>
          </Box>

          <Box sx={{p: 1}}>
              <FormControlLabel
              control={<Checkbox checked={props.isChecked.pioreactor_unit_activity_data_rollup} onChange={props.handleChange} name="pioreactor_unit_activity_data_rollup" />}
              label="Pioreactor unit activity data roll-up"
            />
            <Typography sx={datasetDescription} gutterBottom>
              This dataset is a rolled-up version of Pioreactor unit activity data (above) aggregated to the minute level. This is useful for reducing the size of the exported dataset.
            </Typography>
          </Box>

          <Box sx={{p: 1}}>
            <FormControlLabel
            control={<Checkbox checked={props.isChecked.dosing_events} onChange={props.handleChange} name="dosing_events" />}
            label="Dosing event log"
            />
            <Typography  sx={datasetDescription} gutterBottom>
              In this dataset, you'll find a detailed log table of all dosing events, including the volume exchanged, and the source of who or what triggered the event.
            </Typography>
          </Box>

          <Box sx={{p: 1}}>
            <FormControlLabel
            control={<Checkbox checked={props.isChecked.led_change_events} onChange={props.handleChange} name="led_change_events" />}
            label="LED event log"
            />
            <Typography  sx={datasetDescription} gutterBottom>
              In this dataset, you'll find a log table of all LED events, including the channel, intensity, and the source of who or what triggered the event.
            </Typography>
          </Box>

          <Box sx={{p: 1}}>
            <FormControlLabel
            control={<Checkbox checked={props.isChecked.dosing_automation_settings} onChange={props.handleChange} name="dosing_automation_settings" />}
            label="Dosing automation changelog"
            />
            <Typography  sx={datasetDescription} gutterBottom>
              Anytime an automation is updated (new automation, new setting, etc.), a new row is recorded. You can reconstruct all the dosing automation states
              from this dataset.
            </Typography>
          </Box>

          <Box sx={{p: 1}}>
            <FormControlLabel
            control={<Checkbox checked={props.isChecked.led_automation_settings} onChange={props.handleChange} name="led_automation_settings" />}
            label="LED automation changelog"
            />
            <Typography  sx={datasetDescription} gutterBottom>
              Whenever a LED automation is updated (new automation, new setting, etc.), a new row is recorded. You can reconstruct all the LED automation states
              from this dataset.
            </Typography>
          </Box>

          <Box sx={{p: 1}}>
            <FormControlLabel
            control={<Checkbox checked={props.isChecked.temperature_automation_settings} onChange={props.handleChange} name="temperature_automation_settings" />}
            label="Temperature automation changelog"
            />
            <Typography  sx={datasetDescription} gutterBottom>
              Whenever a temperature automation is updated (new automation, new setting, etc.), a new row is recorded. You can reconstruct all the temperature automation states
              from this dataset.
            </Typography>
          </Box>
          <Box sx={{p: 1}}>
            <FormControlLabel
            control={<Checkbox checked={props.isChecked.dosing_automation_events} onChange={props.handleChange} name="dosing_automation_events" />}
            label="Dosing automation events"
            />
            <Typography  sx={datasetDescription} gutterBottom>
              This dataset includes a log of automation events created by dosing automations.
            </Typography>
          </Box>

          <Box sx={{p: 1}}>
            <FormControlLabel
            control={<Checkbox checked={props.isChecked.led_automation_events} onChange={props.handleChange} name="led_automation_events" />}
            label="LED automation events"
            />
            <Typography  sx={datasetDescription} gutterBottom>
              This dataset includes a log of automation events created by LED automations.
            </Typography>
          </Box>

          <Box sx={{p: 1}}>
            <FormControlLabel
            control={<Checkbox checked={props.isChecked.temperature_automation_events} onChange={props.handleChange} name="temperature_automation_events" />}
            label="Temperature automation events"
            />
            <Typography  sx={datasetDescription} gutterBottom>
              This dataset includes a log of automation events created by temperature automations.
            </Typography>
          </Box>

          <Box sx={{p: 1}}>
            <FormControlLabel
            control={<Checkbox checked={props.isChecked.kalman_filter_outputs} onChange={props.handleChange} name="kalman_filter_outputs" />}
            label="Kalman filter outputs"
            />
            <Typography  sx={datasetDescription} gutterBottom>
              This dataset includes a time series of the internal Kalman filter. The Kalman filter produces the normalized optical densities, growth rates, an acceleration term, and variances (and covariances) between the estimates.
            </Typography>
          </Box>

          <Box sx={{p: 1}}>
            <FormControlLabel
            control={<Checkbox checked={props.isChecked.stirring_rates} onChange={props.handleChange} name="stirring_rates" />}
            label="Stirring rates"
            />
            <Typography  sx={datasetDescription} gutterBottom>
              This dowload includes the measured RPM of the onboard stirring.
            </Typography>
          </Box>

          <Box sx={{p: 1}}>
            <FormControlLabel
            control={<Checkbox checked={props.isChecked.pioreactor_unit_labels} onChange={props.handleChange} name="pioreactor_unit_labels" />}
            label="Pioreactor unit labels"
            />
            <Typography  sx={datasetDescription} gutterBottom>
              In this dataset, you'll find the labels assigned to a Pioreactor during an experiment.
            </Typography>
          </Box>


          <Box sx={{p: 1}}>
            <FormControlLabel
            control={<Checkbox checked={props.isChecked.pwm_dcs} onChange={props.handleChange} name="pwm_dcs" />}
            label="PWM duty cycles"
            />
            <Typography  sx={datasetDescription} gutterBottom>
              This dataset contains a time series of the PWMs duty cycle percentages. Useful for debugging PWM use.
            </Typography>
          </Box>

          <Box sx={{p: 1}}>
            <FormControlLabel
            control={<Checkbox checked={props.isChecked.ir_led_intensities} onChange={props.handleChange} name="ir_led_intensities" />}
            label="IR LED intensities"
            />
            <Typography  sx={datasetDescription} gutterBottom>
              This dataset contains a time series of the relative IR intensities used to normalized OD readings. Useful for debugging OD readings.
            </Typography>
          </Box>

          <Box sx={{p: 1}}>
            <FormControlLabel
            control={<Checkbox checked={props.isChecked.calibrations} onChange={props.handleChange} name="calibrations" />}
            label="Calibrations"
            />
            <Typography  sx={datasetDescription} gutterBottom>
              This dataset contains all the calibrations produced by Pioreactors in your cluster.
            </Typography>
          </Box>

          <Box sx={{p: 1}}>
            <FormControlLabel
            control={<Checkbox checked={props.isChecked.liquid_volumes} onChange={props.handleChange} name="liquid_volumes" />}
            label="Liquid volumes"
            />
            <Typography  sx={datasetDescription} gutterBottom>
              This dataset contains time series for the amount of volume calculated to be in the Pioreactors during experiments.
            </Typography>
          </Box>

        </FormGroup>
      </FormControl>
    </Box>
)}


function ExportDataContainer() {
  const [queryParams, setQueryParams] = useSearchParams();
  const [isRunning, setIsRunning] = React.useState(false)
  const [isError, setIsError] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState("")


  const [state, setState] = React.useState({
    experimentSelection: queryParams.get("experiment") || "",
    partitionByUnitSelection: false,
    datasetCheckbox: {
      pioreactor_unit_activity_data: false || queryParams.get("pioreactor_unit_activity_data") === "1",
      growth_rates: false || queryParams.get("growth_rates") === "1",
      dosing_events: false || queryParams.get("dosing_events") === "1",
      led_change_events: false || queryParams.get("led_change_events") === "1",
      experiments: false || queryParams.get("experiments") === "1",
      od_readings: false || queryParams.get("od_readings") === "1",
      od_readings_filtered: false || queryParams.get("od_readings_filtered") === "1",
      logs: false || queryParams.get("logs") === "1",
      alt_media_fractions: false || queryParams.get("alt_media_fractions") === "1",
      dosing_automation_settings: false || queryParams.get("dosing_automation_settings") === "1",
      led_automation_settings: false || queryParams.get("led_automation_settings") === "1",
      temperature_automation_settings: false || queryParams.get("temperature_automation_settings") === "1",
      kalman_filter_outputs: false || queryParams.get("kalman_filter_outputs") === "1",
      stirring_rates: false || queryParams.get("stirring_rates") === "1",
      temperature_readings: false || queryParams.get("temperature_readings") === "1",
      pioreactor_unit_labels: false || queryParams.get("pioreactor_unit_labels") === "1",
      led_automation_events: false || queryParams.get("led_automation_events") === "1",
      dosing_automation_events: false || queryParams.get("dosing_automation_events") === "1",
      temperature_automation_events: false || queryParams.get("temperature_automation_events") === "1",
      pwm_dcs: false || queryParams.get("pwm_dcs") === "1",
      ir_led_intensities: false || queryParams.get("ir_led_intensities") === "1",
      calibrations: false || queryParams.get("calibrations") === "1",
      liquid_volumes: false || queryParams.get("liquid_volumes") === "1",
      pioreactor_unit_activity_data_rollup: false || queryParams.get("pioreactor_unit_activity_data_rollup") === "1",
    }
  });

  const count = () => Object.values(state.datasetCheckbox).reduce((acc, checked) => acc + (checked === true ? 1 : 0), 0);

  const onSubmit =  (event) => {
    event.preventDefault()

    if (!Object.values(state['datasetCheckbox']).some((e) => e)) {
      setIsError(true)
      setErrorMsg("At least one dataset must be selected.")
      return
    }

    setIsRunning(true)
    setErrorMsg("")
    fetch('/api/export_datasets',{
        method: "POST",
        body: JSON.stringify(state),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
    }).then(res => res.json())
      .then(res => {
      var link = document.createElement("a");
      const filename = res['filename'].replace(/%/g, "%25")
      link.setAttribute('export', filename);
      link.href = "/static/exports/" + filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setIsRunning(false)
    }).catch(e => {
      setIsRunning(false)
      setIsError(true)
      setErrorMsg("Server error occurred. Check logs.")
      console.log(e)
    });
  }

  const handleCheckboxChange = (event) => {
    setState(prevState => ({
      ...prevState,
      datasetCheckbox: {...state.datasetCheckbox, [event.target.name]: event.target.checked }
    }));
  };

  function handleExperimentSelectionChange(experimentName) {
    setState(prevState => ({
      ...prevState,
      experimentSelection: experimentName
    }));
  };

  function handlePartitionByUnitChange(event) {
    setState(prevState => ({
      ...prevState,
      partitionByUnitSelection: event.target.checked
    }));
  };

  const errorFeedbackOrDefault = isError ? <Box color="error.main">{errorMsg}</Box>: ""
  return (
    <React.Fragment>
      <Box>
        <Box sx={{display: "flex", justifyContent: "space-between", mb: 1}}>
          <Typography variant="h5" component="h2">
            <Box fontWeight="fontWeightBold">
              Export data
            </Box>
          </Typography>
          <Box sx={{display: "flex", flexDirection: "row", justifyContent: "flex-start", flexFlow: "wrap"}}>
            <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                loading={isRunning}
                loadingPosition="end"
                onClick={onSubmit}
                endIcon={<FileDownloadIcon />}
                disabled={count() === 0}
                style={{textTransform: 'none'}}
              >
                Export { count() > 0 ?  count() : ""}
            </LoadingButton>
          </Box>
        </Box>
      </Box>
      <Card >
        <CardContent sx={{p: 1}}>
          <p style={{marginLeft: 10}}>{errorFeedbackOrDefault}</p>

          <form>
            <Grid container spacing={0}>
              <Grid item xs={12} md={12}>
                <ExperimentSelection
                  experimentSelection={state.experimentSelection}
                  handleChange={handleExperimentSelectionChange}
                />
              </Grid>
              <Grid item xs={12} md={12}>
                <PartitionByUnitSelection
                  partitionByUnitSelection={state.partitionByUnitSelection}
                  handleChange={handlePartitionByUnitChange}
                />
              </Grid>
              <Grid item xs={12} md={12}>
                <CheckboxesGroup
                isChecked={state.datasetCheckbox}
                handleChange={handleCheckboxChange}
                />
              </Grid>

              <Grid item xs={0}/>
              <Grid item xs={12}>
                <p style={{textAlign: "center", marginTop: "30px"}}>Learn more about <a href="https://docs.pioreactor.com/user-guide/export-data" target="_blank" rel="noopener noreferrer">data exporting</a>.</p>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
  </React.Fragment>
  )
}


function ExportData(props) {
    React.useEffect(() => {
      document.title = props.title;
    }, [props.title]);
    return (
        <Grid container spacing={2} >
          <Grid item md={12} xs={12}>
            <ExportDataContainer/>
          </Grid>
        </Grid>
    )
}

export default ExportData;

