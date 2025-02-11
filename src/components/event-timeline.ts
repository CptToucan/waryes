import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {WeaponEvent} from '../classes/damage-calculator/DamageCalculator';

@customElement('event-timeline')
export class EventTimeline extends LitElement {
  static get styles() {
    return css`
      :host {
        height: 400px;
      }
    `;
  }

  @property()
  events: WeaponEvent[] = [];

  @property()
  title: string = '';

  render(): TemplateResult {
    let ammoDescriptorNames: string[] = [];
    const eventData: [string, number, number, number, boolean][] = [];
    const remainingHp: [number, number][] = [];

    for (const wEvent of this.events) {
      let eventName: string = wEvent.type;
      if (eventName === 'missile-hit') {
        eventName = 'hit';
      }
      if (eventName === 'missile-launch') {
        eventName = 'launch';
      }

      if (eventName === 'shot') {
        eventName = 'hit';
      }

      if ('hit' in wEvent && wEvent.hit === false) {
        eventName = 'miss';
      }

      if (!ammoDescriptorNames.includes(wEvent.weaponName)) {
        ammoDescriptorNames.push(wEvent.weaponName);
      }

      eventData.push([
        eventName,
        ammoDescriptorNames.indexOf(wEvent.weaponName),
        Number(wEvent.time.toFixed(2)),
        'duration' in wEvent ? (wEvent as any).duration : 0,
        'hit' in wEvent ? (wEvent as any).hit : false,
      ]);

      'remainingHp' in wEvent &&
        remainingHp.push([Number(wEvent.time.toFixed(2)), wEvent.remainingHp]);
    }

    const positionCounts: {[key: string]: number} = {};
    const positionOffsets: {[key: string]: number} = {};
    eventData.forEach(([_type, y, x]) => {
      const key = `${y}-${x}`;
      if (!positionCounts[key]) {
        positionCounts[key] = 0;
      }
      positionCounts[key]++;
    });

    Object.keys(positionCounts).forEach((key) => {
      positionOffsets[key] = 0;
    });

    const offsets = eventData.map(([_type, y, x]) => {
      const key = `${y}-${x}`;
      const offset = positionOffsets[key];
      positionOffsets[key] += 1; // Adjust the offset as needed
      return offset;
    });

    console.log(remainingHp);

    const option = {
      legend: {
        data: ['Event'],
        left: 'right',
      },

      title: {
        text: this.title || 'Event Timeline',
      },

      grid: {
        top: 2,
        left: 2,
        bottom: 30,
        right: 10,
        containLabel: true,
      },

      tooltip: {
        position: 'top',
        formatter: function (params: any) {
          console.log(params);
          if ((params.seriesIndex === 0)) {
            return `${ammoDescriptorNames[params.value[1]]}  ${params.value[0]} at ${
              params.value[2]
            }s`;
          }

          return `
            HP at ${params.value[0]}s: ${params.value[1]}
          `;
        },
      },

      xAxis: {
        name: 'Time (s)',
        nameLocation: 'center',
        nameGap: 30,
        type: 'value',
        boundaryGap: false,
        splitLine: {
          show: true,
        },
        axisLine: {
          show: false,
        },
      },
      yAxis: [
        {
          type: 'category',
          data: ammoDescriptorNames,
          axisLine: {
            show: false,
          },
          axisLabel: {
            overflow: 'truncate',
            width: 100,
          },
        },
        {
          type: 'value',
          name: 'HP',
          axisLine: {
            show: false,
          },
          splitLine: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: 'Data',
          type: 'custom',
          encode: {
            x: 2,
            y: 1,
          },
          symbol: 'roundRect',
          renderItem: renderItem.bind({data: eventData, offsets}),
          label: {
            show: true,
            formatter: function (params: any) {
              return params.value[0];
            },
          },

          labelLayout: {
            dy: -10,
          },
          data: eventData,
          animationDelay: function (idx: any) {
            return idx * 5;
          },
        },
        {
          yAxisIndex: 1,
          name: 'HP',
          type: 'line',
          encode: {
            x: 0,
            y: 1,
          },
          data: remainingHp,
        },
      ],
    };

    return html` <e-chart .options=${option}> </e-chart>`;
  }
}

function renderItem(
  this: {data: [string, number, number, number, boolean][]; offsets: number[]},
  params: any,
  api: any
) {
  const categoryIndex = api.value(1);

  const currentIndex = params.dataIndex;

  // const eventType = api.value(0);

  const position = api.coord([api.value(2), categoryIndex]);

  const linePosition = api.coord([api.value(2) + api.value(3), categoryIndex]);

  let cx = position[0];
  let cy = position[1];

  if (this.offsets[currentIndex] > 0) {
    cy += 30 * this.offsets[currentIndex];
  }

  // if previous value is the same position then move this one down 15 pixels relative to previous one

  // if next value is the same position then move this one up 15 pixels relative to next one

  const x2 = linePosition[0];
  const y2 = cy;
  let mainCircleStyle = api.style();

  mainCircleStyle.fill = '#a7b3c4';
  mainCircleStyle.textStroke = 'transparent'; // This will make the label outline not visible

  if (api.value(0) === 'miss') {
    mainCircleStyle.fill = '#ff5454';
  }

  if (api.value(0) === 'hit') {
    mainCircleStyle.fill = '#7fff75';
  }

  function calculateRectangleAboutCenter(
    x: number,
    y: number,
    width: number = 5,
    height: number = 5
  ) {
    return {
      x: x - width / 2,
      y: y - height / 2,
      width,
      height,
    };
  }

  let returnVal: any = {
    type: 'group',
    children: [
      {
        type: 'rect',
        shape: calculateRectangleAboutCenter(cx, cy),
        style: mainCircleStyle,
      },
    ],
  };

  if (api.value(3) > 0) {
    returnVal.children.push({
      type: 'line',
      shape: {
        x1: cx,
        y1: cy,
        x2: x2,
        y2: y2,
      },
      style: {
        stroke: '#a7b3c4',
      },
    });

    returnVal.children.push({
      type: 'circle',
      shape: calculateRectangleAboutCenter(x2, y2),

      style: {
        fill: '#a7b3c4',
      },
    });
  }

  return returnVal;
}

declare global {
  interface HTMLElementTagNameMap {
    'event-timeline': EventTimeline;
  }
}
