import React, {useEffect } from "react";
import { makeStyles } from "@mui/styles";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

const useStyles = makeStyles((theme) => ({
  textFieldCompact: {
    marginTop: theme.spacing(3),
    marginRight: theme.spacing(2),
    marginBottom: theme.spacing(0),
    width: "18ch",
  }
}));



function AutomationForm(props){
  const classes = useStyles();
  const defaults = Object.assign({}, ...props.fields.map(field => ({[field.key]: field.default})))
  useEffect(() => {
    props.updateParent(defaults)
  }, [props.fields])


  const onSettingsChange = (e) => {
    props.updateParent({[e.target.id]: e.target.value})
  }


  var listOfDisplayFields = props.fields.map(field => {
      switch (field.type) {
        case 'numeric':
          return <TextField
            type="number"
            size="small"
            autoComplete={"off"}
            id={field.key}
            key={field.key + props.name}
            label={field.label}
            defaultValue={field.default}
            disabled={field.disabled}
            InputProps={{
              endAdornment: <InputAdornment position="end">{field.unit}</InputAdornment>,
            }}
            variant="outlined"
            onChange={onSettingsChange}
            onKeyPress={(e) => {e.key === 'Enter' && e.preventDefault();}}
            className={classes.textFieldCompact}
          />
        case 'string':
        default:
          return <TextField
            size="small"
            autoComplete={"off"}
            id={field.key}
            key={field.key + props.name}
            label={field.label}
            defaultValue={field.default}
            disabled={field.disabled}
            InputProps={{
              endAdornment: <InputAdornment position="end">{field.unit}</InputAdornment>,
            }}
            variant="outlined"
            onChange={onSettingsChange}
            onKeyPress={(e) => {e.key === 'Enter' && e.preventDefault();}}
            className={classes.textFieldCompact}
          />
      }
    }
  )

  return (
    <div>
        <p style={{whiteSpace: "pre-line"}}> {props.description} </p>
        {listOfDisplayFields}
    </div>
)}


export default AutomationForm;