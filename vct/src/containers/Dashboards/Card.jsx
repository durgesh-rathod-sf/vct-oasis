import React, { Component, Fragment } from 'react';
import "./ValueTrackingTabs.css";
import Icons from "./Icons"
import ReactTooltip from 'react-tooltip';
import redAlert from '../../assets/publishDashboard/red_alert.svg';
import greenAlert from '../../assets/publishDashboard/green_alert.svg';


class Card extends Component {

    render() {
        return (
            <Fragment>
                <div className={`boxStyles ${this.props.netBenefitClass === 'netBenefitClass' ? 'netBenefitClass' : ''}`}
                    data-place="bottom" data-for={`${this.props.total.label}_${this.props.total.value}`}
                    data-tip="">
                    <span><span className="cardsTitle">{this.props.total.label}</span> {(this.props.total.label === "BENEFIT VARIANCE" || this.props.total.label === "INVESTMENT VARIANCE") && (this.props.total.value !== "" && (this.props.total.value.includes('(') ))? <img src={redAlert} style={{ float: 'right' }} /> : (this.props.total.label === "BENEFIT VARIANCE" || this.props.total.label === "INVESTMENT VARIANCE") && (this.props.total.value !== "" || this.props.total.value === "$ 0" ) ? <img src={greenAlert} style={{ float: 'right' }} /> : ""}</span>
                    <p className="contentPara cardValue"><span >{this.props.total.value}</span><img src={Icons.Dashboard[this.props.total.icon]} style={{ float: "right", width: "30px", height: "30px" }}></img></p>
                    <small>{this.props.total.subvalue}</small>
                </div>
                <ReactTooltip id={`${this.props.total.label}_${this.props.total.value}`}>
                    {this.props.total.label === "TOTAL NET BENEFITS" ? "NET BENEFIT" :
                        this.props.total.label} : {this.props.page === 'valueArchitecting' ? this.props.total.unroundedValue: this.props.total.value}
                </ReactTooltip>

            </Fragment>
        );
    }
}

export default Card;
