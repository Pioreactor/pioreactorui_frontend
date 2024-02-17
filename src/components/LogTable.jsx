import React from 'react'

import clsx from 'clsx';
import moment from 'moment';
import mqtt from 'mqtt'


import {withStyles} from '@mui/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

const useStyles = theme => ({
  tightCell: {
    padding: "6px 6px 6px 10px",
    fontSize: 13,
  },
  smallText: {
    fontSize: 12,
  },
  headerCell: {
    backgroundColor: "white",
    padding: "8px 6px 6px 6px",
  },
  tightRight: {
    textAlign: "right"
  },
  errorLog: {
    backgroundColor: "#ff7961"
  },
  warningLog: {
    backgroundColor: "#FFEA8A"
  },
  noticeLog: {
    backgroundColor: "#addcaf"
  },
  nowrap: {
    whiteSpace: "nowrap",
  }
});

const levelMappingToOrdinal = {
  NOTSET: 0,
  DEBUG: 1,
  INFO: 2,
  NOTICE: 2.5,
  WARNING: 3,
  ERROR: 4,
  CRITICAL: 5
}


class LogTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {listOfLogs: []};
    this.onConnect = this.onConnect.bind(this);
    this.onMessage = this.onMessage.bind(this);
  }

  async getData() {
    await fetch("/api/logs/recent?" + new URLSearchParams({
        min_level: this.props.config.logging.ui_log_level
      }))
      .then(response => {
        return response.json();
      })
      .then(logs => {
        this.setState({listOfLogs: logs.map((log, index) => {
          return {...log, key: index};
          })
        })
      }).catch((e) => {
        console.log(e)
      });
  }

  componentDidMount() {
    this.getData()

    const userName = this.props.config.mqtt.username || "pioreactor"
    const password = this.props.config.mqtt.password || "raspberry"

    const brokerUrl = `${this.props.config.mqtt.ws_protocol}://${this.props.config.mqtt.broker_address}:${this.props.config.mqtt.broker_ws_port || 9001}/mqtt`;

    this.client = mqtt.connect(brokerUrl, {
      username: userName,
      password: password,
    });

    this.client.on("connect", () => this.onConnect() )

    this.client.on("message", (topic, message) => {
      this.onMessage(topic, message);
    });

  }

  componentDidUpdate(prevProps) {
     if (prevProps.experiment !== this.props.experiment) {
      this.getData()
     }
  }

  onConnect() {
    this.client.subscribe([`pioreactor/+/${this.props.experiment}/logs/+`,`pioreactor/+/$experiment/logs/+`])
  }

  onMessage(topic, message) {
    if (this.state.listOfLogs.length > 50){
      this.state.listOfLogs.pop()
    }
    const unit = topic.toString().split("/")[1]
    const payload = JSON.parse(message.toString())

    if (levelMappingToOrdinal[payload.level.toUpperCase()] < levelMappingToOrdinal[this.props.config.logging.ui_log_level.toUpperCase()]){
      return
    }

    this.setState({
      listOfLogs: [
      {
        timestamp: moment.utc().format('YYYY-MM-DD[T]HH:mm:ss.SSSSS[Z]'),
        pioreactor_unit: unit,
        message: String(payload.message),
        task: payload.task, is_error: (payload.level === "ERROR"),
        is_warning: (payload.level === "WARNING"),
        is_notice: (payload.level === "NOTICE"),
        key: Math.random()
      }
    , ...this.state.listOfLogs]
    });
  }

  relabelUnit(unit) {
    return (this.props.relabelMap && this.props.relabelMap[unit]) ? `${this.props.relabelMap[unit]} / ${unit}` : unit
  }

  timestampCell(timestamp) {
    const ts = moment.utc(timestamp, 'YYYY-MM-DD[T]HH:mm:ss.SSSSS[Z]')
    const localTs = ts.local()
    if (this.props.byDuration){
      const deltaHours = Math.round(ts.diff(this.props.experimentStartTime, 'hours', true) * 1e2)/1e2
      return <span title={localTs.format('YYYY-MM-DD HH:mm:ss.SS')}> {deltaHours} h </span>
    }
    else {
      return <span title={localTs.format('YYYY-MM-DD HH:mm:ss.SS')}>{localTs.format('HH:mm:ss')} </span>
    }
  }

  render(){
    const { classes } = this.props;
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2">
            <Box fontWeight="fontWeightRegular">
              Recent event logs
            </Box>
          </Typography>
          <TableContainer style={{ height: "660px", width: "100%", overflowY: "scroll"}}>
            <Table stickyHeader size="small" aria-label="log table">
               <TableHead>
                <TableRow>
                  <TableCell className={clsx(classes.headerCell)}>Time</TableCell>
                  <TableCell className={clsx(classes.headerCell)}>Pioreactor</TableCell>
                  <TableCell className={clsx(classes.headerCell)}>Source</TableCell>
                  <TableCell className={clsx(classes.headerCell)}>Message</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {this.state.listOfLogs.map(log => (
                  <TableRow key={log.key}>
                    <TableCell className={clsx(classes.nowrap, classes.tightCell, classes.smallText, {[classes.noticeLog]: log.is_notice, [classes.errorLog]: log.is_error, [classes.warningLog]: log.is_warning})}>
                      {this.timestampCell(log.timestamp)}
                    </TableCell>
                    <TableCell className={clsx(classes.tightCell, classes.smallText, {[classes.noticeLog]: log.is_notice, [classes.errorLog]: log.is_error, [classes.warningLog]: log.is_warning})}> {this.relabelUnit(log.pioreactor_unit)}</TableCell>
                    <TableCell className={clsx(classes.tightCell, classes.smallText, {[classes.noticeLog]: log.is_notice, [classes.errorLog]: log.is_error, [classes.warningLog]: log.is_warning})}>{log.task.replace(/_/g, ' ')}</TableCell>
                    <TableCell className={clsx(classes.tightCell, classes.smallText, {[classes.noticeLog]: log.is_notice, [classes.errorLog]: log.is_error, [classes.warningLog]: log.is_warning})}>{log.message}</TableCell>
                  </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );}
}



export default withStyles(useStyles)(LogTable);
