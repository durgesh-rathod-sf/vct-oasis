import React, { Fragment } from 'react';
import './ReviewValueDriverTree.css';
import smallPlus from '../../assets/project/fvdt/small-plus.svg'
var SessionStorage = require('store/storages/sessionStorage');

const ReviewValueDriverTreeHeader = (props) => {
    // let option = SessionStorage.read('option_selected')
    return (
        <Fragment>
            <div  className={`vdt-tree-header-main ${ props.fullScreen ? '' : props.isBusinessCase ? 'dbc-vdt-header' : ''}`}>

            
            <Fragment key="vdt_header_main">
                <div className="tree-only-header" style={{width:(props.isBusinessCase && !props.fullScreen ? '100%' : '615px' ),marginRight:(props.isBusinessCase ? '0%' : '0.5%' )}}>

                
                <div className="constDiv" style={{ width:  '20%' }}>
                    Strategic Objective
                    {props.customVDT===true?
                        <img src={smallPlus} alt="" onClick={() => props.addMoreObjectives('SO')} style={{ color: '#ffffff', cursor: 'pointer', paddingLeft:'2px' }}>
                            
                        </img>:''}
                </div>
                <div className="constDiv" style={{ width:  '21%' }}>
                Financial / Non-Financial Objective
                    {props.customVDT===true?
                        <img src={smallPlus} alt="" onClick={() => props.addMoreObjectives('FO')} style={{ color: '#ffffff', cursor: 'pointer', paddingLeft:'2px' }}>
                            
                        </img>:''}
                </div>
                <div className="constDiv" style={{ width:  '20%' }}>
                    Business Objective
                    {props.customVDT===true?
                        <img src={smallPlus} alt="" onClick={() => props.addMoreObjectives('BO')} style={{ color: '#ffffff', cursor: 'pointer', paddingLeft:'2px' }}>
                            
                        </img>:''}
                </div>
                {!props.fullScreen ?
                    <Fragment>
                        <div className="constDiv" style={{ width:  '19%' }}>
                            Value Driver
                            {props.customVDT===true?
                                <img src={smallPlus} alt="" onClick={() => props.addMoreObjectives('VD')} style={{ color: '#ffffff', cursor: 'pointer', paddingRight:'10px' }}>
                                
                                </img>:''}
                        </div>
                        <div className="constDiv" style={{ width: '20%' }}>
                            KPI
                            {props.customVDT===true?
                                <img src={smallPlus} alt="" onClick={() => props.addMoreObjectives('KPI')} style={{ color: '#ffffff', cursor: 'pointer', paddingLeft:'2px' }}>
                                    
                                </img>:''}
                    </div>
                    </Fragment> :
                    <Fragment>
                        <div className="constDiv" style={{ width:  '20%'}}>
                            Value  Driver
                        </div>
                        <div className="constDiv" style={{ width:  '20%'}}>
                            Operational KPI
                           
                        </div>
                    </Fragment>}

                                </div>
            </Fragment>
            {props.isBusinessCase ? "" :
                <div className="table-only-header" >
                    <div className="rvdt-header-alignment">
                        KPI Unit
                {/* <button className="collapseBtn">[-]</button> */}
                    </div>
                    <div className="rvdt-header-alignment">
                        Benchmark Best-in-Class Improvement
                {/* <button className="collapseBtn" onClick={props.onClickHideUnhide} id="bicBenchmark">[-]</button> */}
                    </div>
                    <div className="rvdt-header-alignment">
                        Benchmark Average Improvement
                {/* <button className="collapseBtn"  onClick={props.onClickHideUnhide} id="avgBenchmark">[-]</button> */}
                    </div>
                    <div className="rvdt-header-alignment">
                        Baseline
                 {/* <button className="collapseBtn"  onClick={props.onClickHideUnhide} id="baseline">[-]</button> */}
                    </div>
                    <div className="rvdt-header-alignment">
                        Target
                {/* <button className="collapseBtn"  onClick={props.onClickHideUnhide} id="target">[-]</button> */}
                    </div>

                    <div className="rvdt-header-alignment trg-ach">
                        Target Achieved
                 {/* <button className="collapseBtn"  onClick={props.onClickHideUnhide} id="targetAchieved">[-]</button> */}
                    </div>
                    
                </div>
            }
            </div>
        </Fragment>
    )
}

export default ReviewValueDriverTreeHeader;