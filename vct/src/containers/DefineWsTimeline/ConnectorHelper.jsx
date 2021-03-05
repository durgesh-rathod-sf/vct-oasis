import React, { Component, Fragment } from 'react';
import ReactTooltip from 'react-tooltip';

const SSHAPE_SIDE_WIDTH = 20;

class ConnectorHelper extends Component {
  constructor(props) {
    super(props);
  }

  calcNormCoordinates = () => {
    let cpt1 = { x: 0, y: 0 };
    let cpt2 = { x: 0, y: 0 };
    let middle = 0;
    middle = this.props.start.x + (this.props.end.x - this.props.start.x) / 2;
    cpt1 = { x: middle, y: this.props.start.y };
    cpt2 = { x: middle, y: this.props.end.y };
    return { cpt1: cpt1, cpt2: cpt2 };
  };

  calcSCoordinates = () => {
    let cpt1 = { x: this.props.start.x + SSHAPE_SIDE_WIDTH, y: this.props.start.y };
    let halfY = (this.props.end.y - this.props.start.y) / 2;
    let cpt2 = { x: cpt1.x, y: cpt1.y + halfY };
    let cpt3 = { x: this.props.end.x - SSHAPE_SIDE_WIDTH, y: cpt2.y };
    let cpt4 = { x: cpt3.x, y: cpt3.y + halfY };
    return { cpt1: cpt1, cpt2: cpt2, cpt3: cpt3, cpt4: cpt4 };
  };

  calcSCoordinatesForSF = () => {
    let SSHAPE_SIDE_WIDTH = 30 // overriding default 20 width, to show different s curve inorder to avoid overlap
    let cpt1 = { x: this.props.start.x - SSHAPE_SIDE_WIDTH, y: this.props.start.y };
    let halfY = (this.props.end.y - this.props.start.y) / 2;
    let cpt2 = { x: cpt1.x, y: cpt1.y + halfY };
    let cpt3 = { x: this.props.end.x + SSHAPE_SIDE_WIDTH, y: cpt2.y };
    let cpt4 = { x: cpt3.x, y: cpt3.y + halfY };
    return { cpt1: cpt1, cpt2: cpt2, cpt3: cpt3, cpt4: cpt4 };
  }

  calcNormCoordinatesForFF = () => {
    let cpt1 = { x: 0, y: 0 };
    let cpt2 = { x: 0, y: 0 };
    let middle = 0;
    let rightCurveWidth = 20;
    // middle = this.props.start.x + (this.props.end.x - this.props.start.x) / 2;
  if (this.props.start.x > this.props.end.x) {
    middle = this.props.start.x + rightCurveWidth;
    cpt1 = { x: middle, y: this.props.start.y };
    cpt2 = { x: middle, y: this.props.end.y };
    return { cpt1: cpt1, cpt2: cpt2 };

  } else {
    middle = this.props.end.x + rightCurveWidth;
    cpt1 = { x: middle, y: this.props.start.y };
    cpt2 = { x: middle, y: this.props.end.y };
    return { cpt1: cpt1, cpt2: cpt2 };
  }    
  };

  calcNormCoordinatesForSS = () => {
    let cpt1 = { x: 0, y: 0 };
    let cpt2 = { x: 0, y: 0 };
    let middle = 0;
    let leftCurveWidth = 20;
    // middle = this.props.start.x + (this.props.end.x - this.props.start.x) / 2;
    if (this.props.start.x > this.props.end.x) {
      middle = this.props.end.x - leftCurveWidth;
    cpt1 = { x: middle, y: this.props.start.y };
    cpt2 = { x: middle, y: this.props.end.y };
    return { cpt1: cpt1, cpt2: cpt2 };
    } else {
      middle = this.props.start.x - leftCurveWidth;
      cpt1 = { x: middle, y: this.props.start.y };
      cpt2 = { x: middle, y: this.props.end.y };
      return { cpt1: cpt1, cpt2: cpt2 };
    }
    
  };

  getPath = () => {
    let coordinates = null;
    if (this.props.relationType === 'FINISH_TO_FINISH') {

      coordinates = this.calcNormCoordinatesForFF();
      return `M${this.props.start.x} ${this.props.start.y}  ${coordinates.cpt1.x} ${coordinates.cpt1.y} ${coordinates.cpt2.x} ${coordinates.cpt2.y} ${this.props.end.x} ${this.props.end.y}`;

    } else if (this.props.relationType === 'START_TO_START') {

      coordinates = this.calcNormCoordinatesForSS();
      return `M${this.props.start.x} ${this.props.start.y}  ${coordinates.cpt1.x} ${coordinates.cpt1.y} ${coordinates.cpt2.x} ${coordinates.cpt2.y} ${this.props.end.x} ${this.props.end.y}`;

    } else if (this.props.relationType === 'FINISH_TO_START') {

      if (this.props.start.x >= this.props.end.x) {
        coordinates = this.calcSCoordinates();
        return `M${this.props.start.x} ${this.props.start.y}  ${coordinates.cpt1.x} ${coordinates.cpt1.y} ${coordinates.cpt2.x} ${coordinates.cpt2.y} ${coordinates.cpt3.x} ${coordinates.cpt3.y} ${coordinates.cpt4.x} ${coordinates.cpt4.y} ${this.props.end.x} ${this.props.end.y}`;
      } else {
        let diff = this.props.end.x - this.props.start.x;
        if (diff < 15) {
          coordinates = this.calcSCoordinates();
          return `M${this.props.start.x} ${this.props.start.y}  ${coordinates.cpt1.x} ${coordinates.cpt1.y} ${coordinates.cpt2.x} ${coordinates.cpt2.y} ${coordinates.cpt3.x} ${coordinates.cpt3.y} ${coordinates.cpt4.x} ${coordinates.cpt4.y} ${this.props.end.x} ${this.props.end.y}`;
        } else {
          coordinates = this.calcNormCoordinates();
          return `M${this.props.start.x} ${this.props.start.y}  ${coordinates.cpt1.x} ${coordinates.cpt1.y} ${coordinates.cpt2.x} ${coordinates.cpt2.y} ${this.props.end.x} ${this.props.end.y}`;
        }        
      }

    } else if (this.props.relationType === 'START_TO_FINISH') {

        coordinates = this.calcSCoordinatesForSF();
        return `M${this.props.start.x} ${this.props.start.y}  ${coordinates.cpt1.x} ${coordinates.cpt1.y} ${coordinates.cpt2.x} ${coordinates.cpt2.y} ${coordinates.cpt3.x} ${coordinates.cpt3.y} ${coordinates.cpt4.x} ${coordinates.cpt4.y} ${this.props.end.x} ${this.props.end.y}`;

    }  
  };

  changeRelationText = (input) => {
    switch (input) {
      case 'FINISH_TO_START':
        return 'Finish to Start';         
      case 'FINISH_TO_FINISH':
        return 'Finish to Finish';
      case 'START_TO_START':
        return 'Start to Start';
      case 'START_TO_FINISH':
        return 'Start to Finish';
      default:
        break;
    }
  }

  onSelect = (e) => {
    if (this.props.onSelectItem) this.props.onSelectItem(this.props.item);
  };

  render() {
    // let pathColor = this.props.isSelected ? Config.values.links.selectedColor : Config.values.links.color;
    return (
      <Fragment>
        <svg x={0} y={0} pointerEvents="none" data-tip=""
          data-type="dark"
          data-for={`tt_svg_${this.props.uniqueId}`}
          style={{ position: 'absolute', top: 0, userSelect: 'none', height: '100%', width: 'inherit' }}>
          <defs>
            <marker id="arrow" stroke="white" fill="white" viewBox="0 0 10 10" refX="10" refY="5"
              markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" strokeLinejoin="round" />
            </marker>
          </defs>
          <g>
            <g className="timeline-link">
              <path
          pointerEvents="stroke"
          // onMouseDown={this.onSelect}
          stroke="transparent"
          d={this.getPath()}
          strokeLinejoin="round"
          fill="transparent"
          strokeWidth="4"
          cursor="pointer"
        />

              <path
                pointerEvents="stroke"
                // onMouseDown={this.onSelect}
                stroke="white"
                d={this.getPath()}
                strokeLinejoin="round"
                fill="transparent"
                strokeWidth="1"
                strokeDasharray = '3'
                strokeDashoffset = '0%'
                cursor="pointer"
                markerEnd="url(#arrow)"

              />
            </g>
          </g>
        </svg>
        <ReactTooltip id={`tt_svg_${this.props.uniqueId}`} html={true}>{this.changeRelationText(this.props.relationType)}</ReactTooltip>


      </Fragment>
    );
  }
}

export default ConnectorHelper;
