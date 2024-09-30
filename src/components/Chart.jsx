import React from "react";
import {
  VictoryChart,
  VictoryLabel,
  VictoryAxis,
  VictoryTheme,
  VictoryLine,
  VictoryScatter,
  VictoryGroup,
  VictoryLegend,
  VictoryTooltip,
  createContainer
} from "victory";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

// Activate the UTC plugin
dayjs.extend(utc);

const sensorRe = /(.*)-[12]/;


function toArray(thing){
   if (Array.isArray(thing)){
      return thing
  } else {
    return [thing]
  }
}


class Chart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      seriesMap: {},
      hiddenSeries: new Set(),
      names: [],
      legendEvents: [],
      fetched: false,
    };

    this.topics = toArray(this.props.topic)
    this.onMessage = this.onMessage.bind(this);
    this.selectLegendData = this.selectLegendData.bind(this);
    this.selectVictoryLines = this.selectVictoryLines.bind(this);
    this.createLegendEvents = this.createLegendEvents.bind(this);
    this.yTransformation = this.props.yTransformation || ((y) => y)
    this.VictoryVoronoiContainer = (this.props.allowZoom  || false) ? createContainer("zoom", "voronoi") : createContainer("voronoi");
  }

  componentDidUpdate(prevProps) {
    if (prevProps.experiment !== this.props.experiment) {
      this.getHistoricalDataFromServer()
      if (this.props.isLiveChart && this.props.client){
          toArray(prevProps.topic).forEach(topic => {
            this.props.unsubscribeFromTopic(`pioreactor/+/${prevProps.experiment}/${topic}`, "Chart")
          });

          this.topics.forEach(topic => {
            this.props.subscribeToTopic(`pioreactor/+/${this.props.experiment}/${topic}`, this.onMessage, "Chart")
          });
      }
    }

    if (this.props.byDuration !== prevProps.byDuration){
      this.getHistoricalDataFromServer()
    }

    if (this.props.lookback !== prevProps.lookback){
      this.getHistoricalDataFromServer()
    }

    if (this.props.isLiveChart && this.props.client){
      this.topics.forEach(topic => {
        this.props.subscribeToTopic(`pioreactor/+/${this.props.experiment}/${topic}`, this.onMessage, "Chart")
      });
    }
    console.log(this.state.legendEvents)

  }

  componentDidMount() {
    this.getHistoricalDataFromServer()
    if (this.props.client && this.props.isLiveChart) {
      this.topics.forEach(topic => {
        this.props.subscribeToTopic(`pioreactor/+/${this.props.experiment}/${topic}`, this.onMessage, "Chart")
      });
    }
  }


  async getHistoricalDataFromServer() {
    if (!this.props.experiment){
      return
    }
    const initialTweak = 0.65 // increase to filter more. The default here is good for samples_per_second=0.2
    const tweak = this.props.config['od_reading.config']['samples_per_second'] * 0.65/0.2

    const queryParams = new URLSearchParams({
        filter_mod_N: this.props.downSample ? Math.max(Math.floor(tweak * Math.min(this.props.deltaHours, this.props.lookback)), 1) : 1,
        lookback: this.props.lookback
    })

    var transformX
    if (this.props.byDuration){
      const experimentStartTime = dayjs.utc(this.props.experimentStartTime)
      transformX = (x) => Math.round(dayjs.utc(x, 'YYYY-MM-DDTHH:mm:ss.SSS').diff(experimentStartTime, 'hours', true) * 1e3)/1e3
    } else {
      transformX = (x) => dayjs.utc(x, 'YYYY-MM-DDTHH:mm:ss.SSS').local()
    }

    await fetch(`/api/experiments/${this.props.experiment}/time_series/${this.props.dataSource}${this.props.dataSourceColumn ? "/" + this.props.dataSourceColumn : ""}?${queryParams}`)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        let initialSeriesMap = {};
        for (const [i, unit] of data["series"].entries()) {

          if (this.props.unit){
            if (this.props.isPartitionedBySensor && ((unit !== this.props.unit + "-2") && (unit !== this.props.unit + "-1"))){
              continue
            }
            else if (!this.props.isPartitionedBySensor && unit !== this.props.unit){
              continue
            }
          }

          if (data["data"][i].length > 0) {
            initialSeriesMap[unit] = {
              data: (data["data"][i]).map(item => ({y: item.y, x: transformX(item.x) })),
              name: unit,
              color: this.getUnitColor(unit),
            };
          }
        }
        let names = Object.keys(initialSeriesMap);
        const events = this.createLegendEvents()
        this.setState({
          seriesMap: initialSeriesMap,
          legendEvents: events,
          names: names,
          fetched: true
        });
      })
      .catch((e) => {
        console.log(e)
        this.setState({fetched: true})
      });
      this.forceUpdate()

  }

  getUnitColor(name){
    if (sensorRe.test(name)){
      let primaryName = name.match(sensorRe)[1]
      return this.getUnitColor(primaryName)
    } else {
      if (this.props.unitsColorMap){
        return this.props.unitsColorMap[name]
      } else {
        return
      }
    }
  }


  createLegendEvents() {
    return [{
      childName: "legend",
      target: "data",
      eventHandlers: {
        onClick: (_, props) => {
          console.log(props)
          return [
            {
              childName: props.datum.name,
              target: "data",
              mutation: () => {
                console.log(this.state.hiddenSeries, props.datum.name)
                if (!this.state.hiddenSeries.has(props.datum.name)) {
                  // Was not already hidden => add to set
                  this.setState((prevState) => ({
                    hiddenSeries: new Set(prevState.hiddenSeries).add(props.datum.name)
                  }));
                } else {
                  // remove from set
                  this.setState((prevState) => ({
                    hiddenSeries: (() => {
                      const newSet = new Set(prevState.hiddenSeries);
                      newSet.delete(props.datum.name);
                      return newSet;
                      })()
                  }));
                }
                return null;
              },
            },
          ];
        },
      },
    }]
  }

  onMessage(topic, message, packet) {
    if (!this.state.fetched){
      return
    }
    if (packet.retain){
      return
    }

    if (!message.toString()){
      return
    }

    try {
        if (this.props.payloadKey) {
            var payload = JSON.parse(message.toString());
            if (!payload.hasOwnProperty(this.props.payloadKey)) {
                throw new Error(`Payload key '${this.props.payloadKey}' not found in the message.`);
            }
            var timestamp = dayjs.utc(payload.timestamp);
            var y_value = parseFloat(payload[this.props.payloadKey]);
        } else {
            var y_value = parseFloat(message.toString());
            var timestamp = dayjs.utc();
        }
    } catch (error) {
        // Exit or handle the error appropriately
        return;
    }
    var duration = Math.round(timestamp.diff(dayjs.utc(this.props.experimentStartTime), 'hours', true) * 1e3)/1e3
    var local_timestamp = timestamp.local()
    const x_value = this.props.byDuration ? duration : local_timestamp

    var unit = this.props.isPartitionedBySensor
      ? topic.split("/")[1] + "-" + (topic.split("/")[4]).replace('od', '')
      : topic.split("/")[1];

    if (this.props.unit){
      if (this.props.isPartitionedBySensor && ((unit !== this.props.unit + "-2") && (unit !== this.props.unit + "-1"))){
        return
      }
      else if (!this.props.isPartitionedBySensor && unit !== this.props.unit){
        return
      }
    }

    try {
      if (!(unit in this.state.seriesMap)){
        const newSeriesMap = {...this.state.seriesMap, [unit]:  {
          data: [{x: x_value, y: y_value}],
          name: unit,
          color: this.getUnitColor(unit)
        }}

        this.setState({ seriesMap: newSeriesMap })
        this.setState({
          names: [...this.state.names, unit]
        })
      } else {
        // .push seems like bad state management, and maybe a hit to performance...
        this.state.seriesMap[unit].data.push({
          x: x_value,
          y: y_value,
        });
        this.setState({ seriesMap: this.state.seriesMap })
      }
    }
    catch (error) {
      console.log(error)
    }
    return;
  }

  xTransformation(x){
    return x
  }

  breakString = (n) => (string) => {
    if (string.length > n){
      return string.slice(0, n-5) + "..." + string.slice(string.length-2, string.length)
    }
    return string
  }

  relabelAndFormatSeries(name){
    if (!this.props.relabelMap){
      return name
    }

    const regexResults = name.match(/(.*)-([12])/);
    if (regexResults) {
      const [_, mainPart, sensor] = regexResults;
      return `${this.breakString(12)(this.props.relabelMap[mainPart] || mainPart)}-ch${sensor}`;
    } else {
      return this.breakString(12)(this.props.relabelMap[name] || name);
    }
  }

  createToolTip = (d) => {
    var x_value
    try {
      if (this.props.byDuration) {
        x_value = `${d.datum.x.toFixed(2)} hours elapsed`
      } else {
        x_value = d.datum.x.format("MMM DD HH:mm")
      }
    } catch {
      x_value = d.datum.x
    }

    return `${x_value}
${this.relabelAndFormatSeries(d.datum.childName)}: ${Math.round(this.yTransformation(d.datum.y) * 10 ** this.props.fixedDecimals) / 10 ** this.props.fixedDecimals}`
  }


  relabelAndFormatSeriesForLegend(name){
    if (!this.props.relabelMap){
      return name
    }

    const nElements = Object.keys(this.props.relabelMap).length;
    let truncateString = this.breakString( Math.floor(100 / nElements) )

    const regexResults = name.match(/(.*)-([12])/);
    if (regexResults) {
      const [_, mainPart, sensor] = regexResults;
      return `${truncateString(this.props.relabelMap[mainPart] || mainPart)}-ch${sensor}`;
    } else {
      return truncateString(this.props.relabelMap[name] || name);
    }
  }


  selectLegendData(name){
    var reformattedName = this.relabelAndFormatSeriesForLegend(name)
    if (Object.keys(this.state.seriesMap).length === 0) {
      return {}
    }
    const line = this.state.seriesMap?.[name];
    const item = {
      name: reformattedName,
      symbol: { fill: line.color },
    };
    if (this.state.hiddenSeries.has(reformattedName)) {
      return { ...item, symbol: { fill: "white" } };
    }
    return item;
  }

  selectVictoryLines(name) {
    var reformattedName = this.relabelAndFormatSeries(name)

    var marker = null;
    if (this.state.seriesMap?.[name]?.data?.length === 1){
      marker = <VictoryScatter
          size={4}
          key={"line-" + reformattedName + this.props.chartKey}
          name={reformattedName}
          style={{
            data: {
              fill: this.state.seriesMap?.[name]?.color
            },
          }}
        />
    }
    else {
        marker = <VictoryLine
          interpolation={this.props.interpolation}
          key={"line-" + reformattedName + this.props.chartKey}
          name={reformattedName}
          style={{
            labels: {fill: this.state.seriesMap?.[name]?.color},
            data: {
              stroke: this.state.seriesMap?.[name]?.color,
              strokeWidth: 2,
            },
            parent: { border: "1px solid #ccc" },
          }}
        />
    }

    return (
      <VictoryGroup
        key={this.props.chartKey}
        data={(this.state.hiddenSeries.has(reformattedName)) ? [] : this.state.seriesMap?.[name]?.data}
        x={(datum) => this.xTransformation(datum.x)}
        y={(datum) => this.yTransformation(datum.y)}
      >
        {marker}

      </VictoryGroup>
    );
  }

  render() {
    return (
        <VictoryChart
          style={{ parent: { maxWidth: "700px"}}}
          title={this.props.title}
          domainPadding={10}
          padding={{ left: 70, right: 50, bottom: 60 + 20 * Math.floor(this.state.names.length / 4), top: 50 }}
          events={this.state.legendEvents}
          height={295 + 20 * Math.floor(this.state.names.length / 4)}
          width={600}
          scale={{x: this.props.byDuration ? 'linear' : "time"}}
          theme={VictoryTheme.material}
          containerComponent={
           <this.VictoryVoronoiContainer
             zoomDimension={'x'}
             responsive={true}
             voronoiBlacklist={['parent']}
             labels={this.createToolTip}
             labelComponent={
               <VictoryTooltip
                 cornerRadius={0}
                 flyoutStyle={{
                   fill: "white",
                   stroke: "#90a4ae",
                   strokeWidth: 1.5,
                 }}
               />
             }

           />
          }
        >
          <VictoryLabel
            text={this.props.title}
            x={300}
            y={30}
            textAnchor="middle"
            style={{
              fontSize: 16,
              fontFamily: "inherit",
            }}
          />
          <VictoryAxis
            style={{
              tickLabels: {
                fontSize: 14,
                padding: 5,
                fontFamily: "inherit",
              },
            }}
            offsetY={60 + 20 * Math.floor(this.state.names.length / 4)}
            label={this.props.byDuration ? "Hours" : "Time"}
            orientation="bottom"
            fixLabelOverlap={true}
            axisLabelComponent={
              <VictoryLabel
                dy={-15}
                dx={262}
                style={{
                  fontSize: 12,
                  fontFamily: "inherit",
                  fill: "grey",
                }}
              />
            }
          />
          <VictoryAxis
            crossAxis={false}
            dependentAxis
            domain={this.props.allowZoom ? null : this.props.yAxisDomain}
            tickFormat={(t) => `${t.toFixed(this.props.fixedDecimals)}`}
            label={this.props.yAxisLabel}
            axisLabelComponent={
              <VictoryLabel
                dy={-41}
                style={{
                  fontSize: 15,
                  padding: 10,
                  fontFamily: "inherit",
                }}
              />
            }
            style={{
              tickLabels: {
                fontSize: 14,
                padding: 5,
                fontFamily: "inherit",
              },
            }}
          />
          <VictoryLegend
            x={65}
            y={270}
            symbolSpacer={6}
            itemsPerRow={4}
            name="legend"
            borderPadding={{ right: 8 }}
            orientation="horizontal"
            cursor="pointer"
            gutter={15}
            rowGutter={5}
            style={{
              labels: { fontSize: 13 },
              data: { stroke: "#485157", strokeWidth: 0.5, size: 6.5 },
            }}
            data={this.state.names.map(this.selectLegendData)}
          />
          {Object.keys(this.state.seriesMap).map(this.selectVictoryLines)}
        </VictoryChart>
    );
  }
}

export default Chart;
