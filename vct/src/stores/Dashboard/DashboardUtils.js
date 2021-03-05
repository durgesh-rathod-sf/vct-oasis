export default class DashBoardUtils {

  static currencyFormatter = function (data) {
    let iData = isNaN(data) ? data.data : data;

    if (iData instanceof Array) {

      iData = iData[iData.length - 1];
    }
    const num = Math.abs(iData);
    let val = '';
    if (num > 1000000) {
      val = `${new Intl.NumberFormat().format(Math.round(num / 1000000))} M`;
    } else if (num > 1000) {
      val = `${new Intl.NumberFormat().format(Math.round(num / 1000))} K`;
    } else {
      val = `${new Intl.NumberFormat().format(num)}`
    }
    return (iData >= 0) ? `$ ${val}` : `($${val})`;
  }
static percentageFormatter = function (data) {
    const num = isNaN(data) ? data.data : data;
    return `${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)} %`;
  }

  static monthFormatter = function (timestamp) {
    const date = new Date(timestamp)
    const sDate = date.toLocaleString('default', { month: 'long', year: 'numeric' });

    return `by ${sDate}`;
  }


  static getPercentage(data, total) {
    return data.map(val => val * 100 / total)

  }

  static getSentivityData(data, percentage) {
    return data.map(val => val * percentage)
  }

  static renderSensitivity(params, api) {
    var xValue = api.value(0);
    var accValue = api.value(3)
    var highPoint = api.coord([xValue, api.value(1) + accValue]);
    var lowPoint = api.coord([xValue, api.value(2) + accValue]);
    if (api.value(2) > api.value(1)) {
      highPoint = api.coord([xValue, api.value(2) + accValue]);
      lowPoint = api.coord([xValue, api.value(1) + accValue]);
    }
    var halfWidth = api.size([1, 0])[0] * 0.1;
    var style = api.style({
      stroke: api.visual('color'),
      fill: null
    });

    return {
      type: 'group',
      children: [{
        type: 'line',
        shape: {
          x1: highPoint[0] - halfWidth, y1: highPoint[1],
          x2: highPoint[0] + halfWidth, y2: highPoint[1]
        },
        style: style
      }, {
        type: 'line',
        shape: {
          x1: highPoint[0], y1: highPoint[1],
          x2: lowPoint[0], y2: lowPoint[1]
        },
        style: style
      }, {
        type: 'line',
        shape: {
          x1: lowPoint[0] - halfWidth, y1: lowPoint[1],
          x2: lowPoint[0] + halfWidth, y2: lowPoint[1]
        },
        style: style
      }, {
        type: 'text',
        style: {
          x: highPoint[0] - halfWidth,
          y: highPoint[1] - halfWidth * 2,
          text: DashBoardUtils.currencyFormatter(api.value(2)),
          fill: '#bbb',
          textFont: api.font({ fontSize: 10 })
        }

      }]
    };
  }
}