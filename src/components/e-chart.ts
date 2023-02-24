/* eslint-disable @typescript-eslint/ban-ts-comment */
import {css, html, LitElement} from 'lit';
import {customElement, query, property} from 'lit/decorators.js';
import * as echarts from 'echarts';

@customElement('e-chart')
export class EChart extends LitElement {
  @property()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: echarts.EChartsOption;

  @query('#echart')
  chartRoot!: HTMLDivElement;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  echartsInstance?: echarts.ECharts;

  willUpdate() {
    if (this.echartsInstance && this.options) {
      this.echartsInstance.setOption(this.options);
    }
  }

  public resize() {
    setTimeout(() => {
      if (this.echartsInstance) {
        this.echartsInstance.resize();
      }
    }, 100);
  }

  resizeHandler: any;


  setupResizeHandler() {
    const handler = this.resize.bind(this);
    this.resizeHandler = handler;
  }

  static get styles() {
    return css`
      #echart {
        height: 100%;
        width: 100%;
      }
    `;
  }

  firstUpdated() {
    echarts.registerTheme('waryes', theme);

    setTimeout(() => {
      const chart = echarts.init(this.chartRoot, 'waryes');
      if(this.options) {
        chart.setOption(this.options);
        this.echartsInstance = chart;
        this.echartsInstance.resize();
      }

    }, 0);
  }

  connectedCallback() {
    super.connectedCallback();
    this.setupResizeHandler();
    // if (this.resizeHandler) {
      window.addEventListener('resize', this.resizeHandler);
    // }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this.resizeHandler);
    this.echartsInstance?.dispose();
  }

  render() {
    return html`<div id="echart"></div>`;
  }
}

const theme = {
  color: ['#ff1fec', '#fdfd55', '#1bf0fe', '#ff8a5b', '#06ff9c'],
  backgroundColor: 'rgba(51,51,51,0)',
  textStyle: {},
  title: {
    textStyle: {
      color: '#f4f5f8',
    },
    subtextStyle: {
      color: '#f4f5f8',
    },
  },
  line: {
    itemStyle: {
      borderWidth: 1,
    },
    lineStyle: {
      width: 2,
    },
    symbolSize: 4,
    symbol: 'circle',
    smooth: false,
  },
  radar: {
    itemStyle: {
      borderWidth: 1,
    },
    lineStyle: {
      width: 2,
    },
    symbolSize: 4,
    symbol: 'circle',
    smooth: false,
  },
  bar: {
    itemStyle: {
      barBorderWidth: 0,
      barBorderColor: '#cccccc',
    },
  },
  pie: {
    itemStyle: {
      borderWidth: 0,
      borderColor: '#cccccc',
    },
  },
  scatter: {
    itemStyle: {
      borderWidth: 0,
      borderColor: '#cccccc',
    },
  },
  boxplot: {
    itemStyle: {
      borderWidth: 0,
      borderColor: '#cccccc',
    },
  },
  parallel: {
    itemStyle: {
      borderWidth: 0,
      borderColor: '#cccccc',
    },
  },
  sankey: {
    itemStyle: {
      borderWidth: 0,
      borderColor: '#cccccc',
    },
  },
  funnel: {
    itemStyle: {
      borderWidth: 0,
      borderColor: '#cccccc',
    },
  },
  gauge: {
    itemStyle: {
      borderWidth: 0,
      borderColor: '#cccccc',
    },
  },
  candlestick: {
    itemStyle: {
      color: '#fd1050',
      color0: '#0cf49b',
      borderColor: '#fd1050',
      borderColor0: '#0cf49b',
      borderWidth: 1,
    },
  },
  graph: {
    itemStyle: {
      borderWidth: 0,
      borderColor: '#cccccc',
    },
    lineStyle: {
      width: 1,
      color: '#aaaaaa',
    },
    symbolSize: 4,
    symbol: 'circle',
    smooth: false,
    color: ['#ff1fec', '#fdfd55', '#1bf0fe', '#ff8a5b', '#06ff9c'],
    label: {
      color: '#f4f5f8',
    },
  },
  map: {
    itemStyle: {
      areaColor: '#eee',
      borderColor: '#444',
      borderWidth: 0.5,
    },
    label: {
      color: '#000',
    },
    emphasis: {
      itemStyle: {
        areaColor: 'rgba(255,215,0,0.8)',
        borderColor: '#444',
        borderWidth: 1,
      },
      label: {
        color: 'rgb(100,0,0)',
      },
    },
  },
  geo: {
    itemStyle: {
      areaColor: '#eee',
      borderColor: '#444',
      borderWidth: 0.5,
    },
    label: {
      color: '#000',
    },
    emphasis: {
      itemStyle: {
        areaColor: 'rgba(255,215,0,0.8)',
        borderColor: '#444',
        borderWidth: 1,
      },
      label: {
        color: 'rgb(100,0,0)',
      },
    },
  },
  categoryAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: '#eeeeee',
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: '#eeeeee',
      },
    },
    axisLabel: {
      show: true,
      color: '#eeeeee',
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ['#aaaaaa'],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['#eeeeee'],
      },
    },
  },
  valueAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: '#eeeeee',
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: '#eeeeee',
      },
    },
    axisLabel: {
      show: true,
      color: '#eeeeee',
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ['#aaaaaa'],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['#eeeeee'],
      },
    },
  },
  logAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: '#eeeeee',
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: '#eeeeee',
      },
    },
    axisLabel: {
      show: true,
      color: '#eeeeee',
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ['#aaaaaa'],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['#eeeeee'],
      },
    },
  },
  timeAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: '#eeeeee',
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: '#eeeeee',
      },
    },
    axisLabel: {
      show: true,
      color: '#eeeeee',
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ['#aaaaaa'],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['#eeeeee'],
      },
    },
  },
  toolbox: {
    iconStyle: {
      borderColor: '#999999',
    },
    emphasis: {
      iconStyle: {
        borderColor: '#666666',
      },
    },
  },
  legend: {
    textStyle: {
      color: '#eeeeee',
    },
  },
  tooltip: {
    axisPointer: {
      lineStyle: {
        color: '#eeeeee',
        width: '1',
      },
      crossStyle: {
        color: '#eeeeee',
        width: '1',
      },
    },
  },
  timeline: {
    lineStyle: {
      color: '#eeeeee',
      width: 1,
    },
    itemStyle: {
      color: '#dd6b66',
      borderWidth: 1,
    },
    controlStyle: {
      color: '#eeeeee',
      borderColor: '#eeeeee',
      borderWidth: 0.5,
    },
    checkpointStyle: {
      color: '#e43c59',
      borderColor: '#c23531',
    },
    label: {
      color: '#eeeeee',
    },
    emphasis: {
      itemStyle: {
        color: '#a9334c',
      },
      controlStyle: {
        color: '#eeeeee',
        borderColor: '#eeeeee',
        borderWidth: 0.5,
      },
      label: {
        color: '#eeeeee',
      },
    },
  },
  visualMap: {
    color: ['#bf444c', '#d88273', '#f6efa6'],
  },
  dataZoom: {
    backgroundColor: 'rgba(47,69,84,0)',
    dataBackgroundColor: 'rgba(255,255,255,0.3)',
    fillerColor: 'rgba(167,183,204,0.4)',
    handleColor: '#a7b7cc',
    handleSize: '100%',
    textStyle: {
      color: '#eeeeee',
    },
  },
  markPoint: {
    label: {
      color: '#f4f5f8',
    },
    emphasis: {
      label: {
        color: '#f4f5f8',
      },
    },
  },
};

declare global {
  interface HTMLElementTagNameMap {
    'e-chart': EChart;
  }
}
