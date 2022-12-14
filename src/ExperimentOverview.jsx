import React from "react";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import LogTable from "./components/LogTable";
import ExperimentSummary from "./components/ExperimentSummary";
import Chart from "./components/Chart";
import MediaCard from "./components/MediaCard";
import PioreactorIcon from './components/PioreactorIcon';
import { Link } from 'react-router-dom';
import {getConfig, getRelabelMap} from "./utilities"


function Overview(props) {

  const [experimentMetadata, setExperimentMetadata] = React.useState({})
  const [relabelMap, setRelabelMap] = React.useState({})
  const [config, setConfig] = React.useState({})

  React.useEffect(() => {
    document.title = props.title;
    function getLatestExperiment() {
        fetch("/api/get_latest_experiment")
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          setExperimentMetadata(data)
        });
      }

    getLatestExperiment()
    getRelabelMap(setRelabelMap)
    getConfig(setConfig)
  }, [props.title])


  return (
    <React.Fragment>
      <Grid container spacing={2} justifyContent="space-between">

        <Grid item xs={12} md={12}>
          <ExperimentSummary experimentMetadata={experimentMetadata}/>
        </Grid>


        <Grid item xs={12} md={7} container spacing={2} justifyContent="flex-start" style={{height: "100%"}}>


          {( config['ui.overview.charts'] && (config['ui.overview.charts']['implied_growth_rate'] === "1")) &&
          <Grid item xs={12}>
            <Chart
              config={config}
              dataSource="growth_rates"
              title={config['ui.overview.settings']['daily_growth_rate'] === "1" ?  "Implied daily growth rate" : "Implied growth rate"}
              topic="growth_rate_calculating/growth_rate"
              payloadKey="growth_rate"
              yAxisLabel={config['ui.overview.settings']['daily_growth_rate'] === "1" ? "Growth rate, d⁻¹" : "Growth rate, h⁻¹"}
              yTransformation={config['ui.overview.settings']['daily_growth_rate'] === "1" ? (y) => 24 * y : (y) => y}
              experiment={experimentMetadata.experiment}
              deltaHours={experimentMetadata.delta_hours}
              interpolation="stepAfter"
              yAxisDomain={config['ui.overview.settings']['daily_growth_rate'] === "1" ? [-0.1, 1.0] : [-0.02, 0.1]}
              lookback={100000}
              fixedDecimals={2}
              relabelMap={relabelMap}
            />
          </Grid>
          }

          {( config['ui.overview.charts'] && (config['ui.overview.charts']['fraction_of_volume_that_is_alternative_media'] === "1")) &&
          <Grid item xs={12}>
            <Chart
              config={config}
              yAxisDomain={[0.00, 0.05]}
              dataSource="alt_media_fractions"
              interpolation="stepAfter"
              payloadKey={null}
              title="Fraction of volume that is alternative media"
              topic="dosing_automation/alt_media_fraction"
              yAxisLabel="Fraction"
              experiment={experimentMetadata.experiment}
              deltaHours={1} // hack to make all points display
              fixedDecimals={3}
              lookback={100000}
              relabelMap={relabelMap}

            />
          </Grid>
          }

          {( config['ui.overview.charts'] && (config['ui.overview.charts']['normalized_optical_density'] === "1")) &&
          <Grid item xs={12}>
            <Chart
              config={config}
              dataSource="od_readings_filtered"
              title="Normalized optical density"
              payloadKey="od_filtered"
              topic="growth_rate_calculating/od_filtered"
              yAxisLabel="Current OD / initial OD"
              experiment={experimentMetadata.experiment}
              deltaHours={experimentMetadata.delta_hours}
              interpolation="stepAfter"
              lookback={parseFloat(config['ui.overview.settings']['filtered_od_lookback_hours'])}
              fixedDecimals={2}
              yAxisDomain={[0.98, 1.02]}
              relabelMap={relabelMap}

            />
          </Grid>
          }

          {( config['ui.overview.charts'] && (config['ui.overview.charts']['raw_optical_density'] === "1")) &&
          <Grid item xs={12}>
            <Chart
              config={config}
              isODReading={true}
              dataSource="od_readings"
              title="Optical density"
              interpolation="stepAfter"
              topic="od_reading/od/+"
              yAxisLabel="Reading"
              payloadKey="od"
              experiment={experimentMetadata.experiment}
              deltaHours={experimentMetadata.delta_hours}
              lookback={parseFloat(config['ui.overview.settings']['raw_od_lookback_hours'])}
              fixedDecimals={3}
              relabelMap={relabelMap}

            />
          </Grid>
         }
          {( config['ui.overview.charts'] && (config['ui.overview.charts']['temperature'] === "1")) &&
          <Grid item xs={12}>
            <Chart
              config={config}
              dataSource="temperature_readings"
              title="Temperature of vials"
              topic="temperature_control/temperature"
              yAxisLabel="temperature, ℃"
              payloadKey="temperature"
              experiment={experimentMetadata.experiment}
              interpolation="stepAfter"
              lookback={10000}
              deltaHours={1} // hack to display all data points
              yAxisDomain={[22.5, 37.5]}
              fixedDecimals={1}
              relabelMap={relabelMap}

            />
          </Grid>
         }
        </Grid>

        <Grid item xs={12} md={5} container spacing={1} justifyContent="flex-end" style={{height: "100%"}}>


          {( config['ui.overview.cards'] && (config['ui.overview.cards']['dosings'] === "1")) &&
            <Grid item xs={12} >
              <MediaCard experiment={experimentMetadata.experiment} config={config} relabelMap={relabelMap}/>
              <Button to="/pioreactors" component={Link} color="primary" style={{textTransform: "none", verticalAlign: "middle", margin: "0px 3px"}}> <PioreactorIcon style={{ fontSize: 17 }} color="primary"/> See all Pioreactor details </Button>
            </Grid>
          }


          {( config['ui.overview.cards'] && (config['ui.overview.cards']['event_logs'] === "1")) &&
            <Grid item xs={12}>
              <LogTable experiment={experimentMetadata.experiment} config={config} relabelMap={relabelMap}/>
            </Grid>
          }

        </Grid>
      </Grid>
    </React.Fragment>
  );
}
export default Overview;
