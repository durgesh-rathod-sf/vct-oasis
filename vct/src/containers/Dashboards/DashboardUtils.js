export default class DashBoardUtils {

  static currencyFormatter = function (data) {
    let iData = isNaN(data) ? data && data.data : data;

    if (iData instanceof Array) {

      iData = iData[iData.length - 1];
    }
    const num = Math.abs(iData);
    let val = '';
    if (num >= 1000000) {
      val = `${new Intl.NumberFormat().format(Math.round(num / 1000000))} M`;
    } else if (num >= 1000) {
      val = `${new Intl.NumberFormat().format(Math.round(num / 1000))} K`;
    } else {
      val = `${new Intl.NumberFormat().format(Math.round(num))}`
    }
    return (iData !== undefined && !isNaN(data)) ? (iData >= 0) ? `$ ${val}` : `$(${val})` : "";
  }
  static convertToMillions = function (data) {
    let iData = isNaN(data) ? data && data.data : data;

    if (iData instanceof Array) {

      iData = iData[iData.length - 1];
    }
    const num = Math.abs(iData);
    let val = '';
  
      val = `${
        // new Intl.NumberFormat().
        // format
        // (Math.round
          (num / 1000000).toFixed(3)} M`;
   
    return (iData !== undefined && !isNaN(data)) ? (iData >= 0) ? `$ ${val}` : `$(${val})` : "";
  }

  static currencyFormatterNoRound = function (data) {
    let iData = isNaN(data) ? data && data.data : data;

    if (iData instanceof Array) {

      iData = iData[iData.length - 1];
    }
    const num = Math.abs(iData);
    let val = '';
    if (num >= 1000000000) {
      val = `${new Intl.NumberFormat().format(Math.round(num / 1000000000))} B`;
    } else if (num >= 1000000) {
      val = `${new Intl.NumberFormat().format((num / 1000000))} M`;
    } else if (num >= 1000) {
      val = `${new Intl.NumberFormat().format((num / 1000))} K`;
    } else {
      val = `${new Intl.NumberFormat().format(num)}`
    }
    return (iData !== undefined && !isNaN(data)) ? (iData >= 0) ? `$ ${val}` : `$(${val})` : "";
  }

  static currencyFormatterNoRoundOneDecimal = function (data) {
    let iData = isNaN(data) ? data && data.data : data;

    if (iData instanceof Array) {

      iData = iData[iData.length - 1];
    }
    const num = Math.abs(iData);
    let val = '';
    if (num >= 1000000) {
      val = `${new Intl.NumberFormat().format((num / 1000000).toFixed(1))} M`;
    } else if (num >= 1000) {
      val = `${new Intl.NumberFormat().format((num / 1000).toFixed(1))} K`;
    } else {
      val = `${new Intl.NumberFormat().format(num.toFixed(1))}`
    }
    return (iData !== undefined && !isNaN(data)) ? (iData >= 0) ? `$ ${val}` : `$(${val})` : "";
  }

  static percentageFormatter = function (data) {
    const num = isNaN(data) ? data.data : data;
    return `${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)} %`;
  }

  static monthFormatter = function (timestamp) {
    const date = new Date(timestamp)
    const sDate = date.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (sDate !== undefined && sDate !== null) ? `by ${sDate}` : "";
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
      }, /* {
        type: 'text',
        style: {
          x: (params.seriesId === 'Low') ? lowPoint[0] - halfWidth : highPoint[0] - halfWidth,
          y: (params.seriesId === 'Low') ? lowPoint[1] + 10 : highPoint[1] - 15,
          text: DashBoardUtils.currencyFormatter(api.value(2)),
          fill: '	#FFFFFF',
          textFont: api.font({ fontSize: 10 })
        }

      } */]
    };
  }

  static removeDuplicate(value) {
    var filteredArray = value.filter(function (item, pos) {
      return value.indexOf(item) === pos;
    });
    return filteredArray;
  }

  static isEmailValid = (email) => {
    if (email !== undefined && email !==null) {
        let value = email.toLowerCase();
        var res = value.substring(value.length, value.length - 14);
        let isVaild = (RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/).test(value)) ? true : false;
        return isVaild;
    }
    else {
        return false;
    }
  }

  
  static formatDate(value) {
    if (value) {
        let date = value.getDate().toString();
        let month = (value.getMonth() + 1).toString();
        let year = value.getFullYear().toString();
        if (month < 10) {
            month = '0' + month;
        }
        if (date < 10) {
            date = '0' + date;
        }
        return `${date}-${month}-${year}`;
    }
}
  static formatDateWithFullMonth(str) {
    if(str !== null && str.length > 0){
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
          ];
      let date = str === " " ? new Date() : new Date(str.substring(3,5)+'-'+str.substring(0,2)+'-'+str.substring(6)),
      mnth = ('0' + (date.getMonth() + 1)).slice(-2),
      day = ('0' + date.getDate()).slice(-2);
      return [day, monthNames[parseInt(mnth -1)], date.getFullYear()].join('-');
    }else{
      return ''
    }
}

static formatDateMMDDYY(str) {
  if(str !== null && str.length > 0){
    let date = str === " " ? new Date() : new Date(str.substring(3,5)+'-'+str.substring(0,2)+'-'+str.substring(6)),
    mnth = ('0' + (date.getMonth() + 1)).slice(-2),
    day = ('0' + date.getDate()).slice(-2);
    return [mnth, day, date.getFullYear()].join('-');
  }else{
    return ''
  }
 
}
}