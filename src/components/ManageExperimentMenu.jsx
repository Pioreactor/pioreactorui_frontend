import React, {useState, useEffect} from "react";

import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Button from "@mui/material/Button";
import ListItemText from "@mui/material/ListItemText";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import PanToolOutlinedIcon from '@mui/icons-material/PanToolOutlined';
import ListItemIcon from '@mui/material/ListItemIcon';
import { useNavigate } from 'react-router-dom';
import { useConfirm } from 'material-ui-confirm';
import { useExperiment } from '../providers/ExperimentContext';


export default function ManageExperimentMenu({experiment}){
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const confirm = useConfirm();
  const navigate = useNavigate();
  const {updateExperiment, allExperiments} = useExperiment()


  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEndExperiment = () => {
    confirm({
      description: 'This will stop running activities in assigned Pioreactors, and unassign all Pioreactors from this experiment. Do you wish to continue?',
      title: "End experiment?",
      confirmationText: "Confirm",
      confirmationButtonProps: {color: "primary"},
      cancellationButtonProps: {color: "secondary"},

      }).then(() =>
        fetch(`/api/experiments/${experiment}/workers`, {method: "DELETE"})
    ).then(() => navigate(0))
  };

  const handleDeleteExperiment = () => {
    confirm({
      description: 'This will stop assigned Pioreactors, unassign Pioreactors from this experiment, and delete experiment data. Do you wish to continue?',
      title: "End experiment?",
      confirmationText: "Confirm",
      confirmationButtonProps: {color: "primary"},
      cancellationButtonProps: {color: "secondary"},

      }).then(() =>
        fetch(`/api/experiments/${experiment}`, {method: "DELETE"})
    ).then(() => updateExperiment(allExperiments.at(1)))
  };

  return (
    <div>
      <Button
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        style={{textTransform: "None"}}
      >
        Manage experiment <ArrowDropDownIcon/>
      </Button>
      <Menu
        id="manage-exp"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={handleEndExperiment}>
          <ListItemIcon>
            <PanToolOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>End experiment</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteExperiment}>
          <ListItemIcon>
            <DeleteOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete experiment</ListItemText>
        </MenuItem>
      </Menu>
    </div>
  );
}
