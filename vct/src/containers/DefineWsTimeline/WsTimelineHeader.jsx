import React, { PureComponent } from 'react';
import Moment from 'moment';
import { inject } from 'mobx-react';
import { VIEW_MODE_DAY, VIEW_MODE_MONTH, VIEW_MODE_YEAR } from './DateConstants';
import DateHelper from './DateHelper';
import './WsTimelineHeader.css';

export class HeaderItem extends PureComponent {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: '1px solid #909090',
          borderRight: 'none',
          position: 'absolute',
          height: 45,
          left: this.props.left,
          width: this.props.width,
          background: '#505050'
        }}
      > {this.props.mode === 'day' ?
        <div style={{width: 'inherit', textAlignLast: 'center'}}>
          <div>{this.props.labelTop}</div>
          <div>{this.props.labelBottom}</div>
          </div>
          : this.props.mode === 'month' ?
          <div style={{width: 'inherit', textAlignLast: 'center'}}>
          <div>{this.props.labelTop}</div>
          <div>{this.props.labelBottom}</div>
          </div>
          : <div>{this.props.labelTop}</div>
      }
        
      </div>
    );
  }
}

@inject('workstreamStore')
class WsTimelineHeader extends PureComponent {
  constructor(props) {
    super(props);
    this.setBoundaries();
  }

  getFormat(mode, position) {
    switch (mode) {
      case 'year':
        return 'YYYY';
      case 'month':
        if (position === 'top') return 'MMM';
        else return 'YYYY';    
      case 'day':
        if (position === 'top') return 'D-MMM';
        else return 'YYYY';
    }
  }

  getModeIncrement(date, mode) {
    switch (mode) {
      case 'year':
        return DateHelper.daysInYear(date.year());
      case 'month':
        return date.daysInMonth();
      default:
        return 1;
    }
  }

  getStartDate = (date, mode) => {
    let year = null;
    switch (mode) {
      case 'year':
        year = date.year();
        return Moment([year, 0, 1]);
      case 'month':
        year = date.year();
        let month = date.month();
        return Moment([year, month, 1]);
      case 'week':
        return date.subtract(date.day(), 'days');
      default:
        return date;
    }
  };

  renderTime = (left, width, mode, key) => {
    let result = [];
    let hourWidth = width / 24;
    let iterLeft = 0;
    for (let i = 0; i < 24; i++) {
      result.push(<HeaderItem key={i} left={iterLeft} width={hourWidth} label={mode === 'shorttime' ? i : `${i}:00`} />);
      iterLeft = iterLeft + hourWidth;
    }
    return (
      <div key={key} style={{ position: 'absolute', height: 20, left: left, width: width }}>
        {' '}
        {result}
      </div>
    );
  };
  getBox(date, mode, lastLeft) {
    let increment = this.getModeIncrement(date, mode) * this.props.dayWidth;
    if (!lastLeft) {
      let starDate = this.getStartDate(date, mode);
      starDate = starDate.startOf('day');
      let now = Moment(this.props.overAllStartDate).startOf('day');
      let daysInBetween = starDate.diff(now, 'days');
      daysInBetween = daysInBetween + this.props.bufferDays;
      lastLeft = DateHelper.dayToPosition(daysInBetween, this.props.nowposition, this.props.dayWidth);
    }

    return { left: lastLeft, width: increment };
  }

  renderHeaderRows = (mode) => {
    let result = { top: [], middle: [], bottom: [] };
    let lastLeft = {};
    let currentTop = '';
    let currentBottom = '';
    let currentDate = null;
    let box = null;

    let start = this.props.currentday;
    let end = this.props.currentday + this.props.numVisibleDays;

    for (let i = start - this.props.bufferDays; i < (end + this.props.bufferDays+1); i++) {
      //The unit of iteration is day
      currentDate = Moment(this.props.overAllStartDate).add(i, 'days');
      if (currentTop !== currentDate.format(this.getFormat(mode, 'top'))) {
        currentTop = currentDate.format(this.getFormat(mode, 'top'));
        currentBottom = currentDate.format(this.getFormat(mode, 'bottom'));
        box = this.getBox(currentDate, mode, lastLeft.top);
        lastLeft.top = box.left + box.width;        
        
        result.top.push(<HeaderItem key={i} left={box.left} width={box.width} 
          mode={mode} labelTop={currentTop} labelBottom={currentBottom} />);
      }
      
    }

    if (result.top && result.top.length > 0) {
      let lengtharr = [...result.top].length;
      this.props.workstreamStore.sumOfBoxesWidth = result.top[lengtharr -1].props.left + result.top[lengtharr -1].props.width;
    }   

    // this.props.workstreamStore.sumOfBoxesWidth = sumOfWidths - this.props.workstreamStore.firstBoxLeft;

    return (
      <div className="timeLine-main-header-container" 
      // style={{ width: DATA_CONTAINER_WIDTH, maxWidth: DATA_CONTAINER_WIDTH }}
      >
        <div className="header-top">
          {result.top}
        </div>
        {/* <div className="header-middle" style={{ ...Config.values.header.middle.style }}>
          {result.middle}
        </div>
        <div className="header-bottom" style={{ ...Config.values.header.bottom.style }}>
          {result.bottom}
        </div> */}
      </div>
    );
  };

  renderHeader = () => {
    switch (this.props.mode) {
      case VIEW_MODE_DAY:
        return this.renderHeaderRows('day');      
      case VIEW_MODE_MONTH:
        return this.renderHeaderRows('month');
      case VIEW_MODE_YEAR:
        return this.renderHeaderRows('year');
    }
  };

  setBoundaries = () => {
    this.start = this.props.currentday - this.props.bufferDays;
    this.end = this.props.currentday + this.props.numVisibleDays + this.props.bufferDays;
  };

  needToRender = () => {
    return this.props.currentday < this.start || this.props.currentday + this.props.numVisibleDays > this.end;
  };

  render() {
    // if (this.refs.Header) this.refs.Header.scrollLeft = this.props.scrollLeft;
    //Check boundaries to see if wee need to recalcualte header
    // if (this.needToRender()|| !this.cache){
    //     this.cache=this.renderHeader();
    //     this.setBoundaries();
    // }
    return (
      <div id="timeline-header" ref="Header" className="timeLine-main-header-viewPort">
        {this.renderHeader()}
      </div>
    );
  }
}

export default  WsTimelineHeader;
