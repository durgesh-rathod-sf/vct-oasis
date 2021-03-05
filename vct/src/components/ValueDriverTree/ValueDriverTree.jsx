import React from 'react';
import './ValueDriverTree.css';
import VisualVDTTable from '../../containers/VisualVDTTable/VisualVDTTable';
import ReactTooltip from 'react-tooltip'

const ValueDriverTree = (props) => {
	const {
		branchTree,
		operationalKpis,
		color,
		kpiId,
		oldKPIValues
	} = props;
	/*const getTooltipData = (description, formula, kpiType) => {
		return `${description} <br /> KPI Formula: ${formula} <br/> KPI Type: ${kpiType}`;
	}*/
	return (
		<div className="row visual-vdt-wrapper">
			<div id="visual_vdt_tree" className="vdt-tree-wrapper">
				{Object.values(branchTree[0]).map((sobjective, index) => (
					<div key={Math.floor(Math.random() * 1001)} id="wrapper">
						<span className="label vdt-node" data-type="dark" data-tip="" data-place="right"
                            data-for={`${Object.keys(branchTree[0])[index]}_sobj`}
							style={{ backgroundColor: '#99d2ff', color: '#000000', paddingTop: "12px", paddingBottom: "8px" }}
						>
							{Object.keys(branchTree[0])[index]}
						</span>
						<ReactTooltip id ={`${Object.keys(branchTree[0])[index]}_sobj`} >
							<span>{Object.keys(branchTree[0])[index]}</span>
						</ReactTooltip>
						<div className="branch lv1">
							{Object.values(branchTree[0])[index].map((fobjective, index1) => (
								<div key={Math.random()} className={Object.values(branchTree[0])[0].length > 1 ? 'entry' : 'entry sole'} >
									<span className="label vdt-node" data-type="dark" data-tip="" data-place="top"
                                    	data-for={`${Object.keys(fobjective)[0]}_fobj`}
										style={{ paddingTop: "12px", paddingBottom: "8px", backgroundColor: '#66bbff', color: '#000000' }}
									>
										{Object.keys(fobjective)[0]}
									</span>
									<ReactTooltip id ={`${Object.keys(fobjective)[0]}_fobj`} >
										<span>{Object.keys(fobjective)[0]}</span>
									</ReactTooltip>
									<div key={Math.random()} className="branch lv2">
										{
											Object.values(fobjective)[0].map((bobjective, index2) => (
												<div key={Math.random()} className={Object.values(fobjective)[0].length > 1 ? 'entry' : 'entry sole'}>
													<span className="label vdt-node" data-type="dark" data-tip="" data-place="top"
                                                        data-for={`${Object.keys(bobjective)[0]}_bobj`}
														style={{ paddingTop: "12px", paddingBottom: "8px", backgroundColor: '#6694ff', color: '#ffffff' }}
													>
														{Object.keys(bobjective)[0]}
													</span>
													<ReactTooltip id ={`${Object.keys(bobjective)[0]}_bobj`} >
														<span>{Object.keys(bobjective)[0]}</span>
													</ReactTooltip>
													<div key={Math.random()} className="branch lv3">
														{
															Object.values(bobjective)[0].map((bkpiobjective, index3) => (
																<div key={Math.random()} className={Object.values(bobjective)[0].length > 1 ? 'entry' : 'entry sole'}>
																	<span className="label vdt-node" data-type="dark" data-tip="" data-place="top"
                                                                        data-for={`${Object.keys(bkpiobjective)[0]}_vobj`} 
																		style={{ paddingTop: "12px", paddingBottom: "8px", backgroundColor: '#008bbf' }}
																	>
																		{Object.keys(bkpiobjective)[0]}
																	</span>
																	<ReactTooltip id ={`${Object.keys(bkpiobjective)[0]}_vobj`} >
																		<span>{Object.keys(bkpiobjective)[0]}</span>
																	</ReactTooltip>
																	{Object.values(bkpiobjective)[0].length > 0 && <div key={Math.random()} className="branch lv4">
																		{
																			Object.values(bkpiobjective)[0].map((valueDriver, index4) => (
																				<div key={Math.random()} className={Object.values(bkpiobjective)[0].length > 1 ? 'entry' : 'entry sole'}>
																					<span className="label vdt-node" style={{
																						paddingTop: "12px", paddingBottom: "8px",
																						backgroundColor: 
																							(Object.values(valueDriver)[0][20].baseline[0] === null || Object.values(valueDriver)[0][21].target[0] === null || Object.values(valueDriver)[0][22].targetAchieved[0] === null || Object.values(valueDriver)[0][22].targetAchieved[0] === "Select Year" || Object.values(valueDriver)[0][22].targetAchieved[0] === "" ) &&
																							!props.isBusinessCase ? 
																							'#dc1414eb' 			//red
																							: color === (!(props.isWorkStreamActuals || !props.isBenefitActuals)) || (props.isKPIBenefitsTab && kpiId === Object.values(valueDriver)[0][0].kpiId[0]) ?
																								'#c284e4'            //violet
																								// '#0e47a1'            //dark blue
																								:Object.values(valueDriver)[0][40].kpiType[0]=== 'NON_FINANCIAL'? '#909090': '#006abf',	//grey: //blue
																						// disabled: (props.isWorkStreamActuals || !props.isBenefitActuals)
																					}}
																						data-type="dark" data-tip=""
																						data-for={`${Object.values(valueDriver)[0][0].kpiId[0]}_${Object.values(valueDriver)[0][6].opKpi[0]}`}
																						onClick={(props.isWorkStreamActuals===true || props.isBenefitActuals===false) ? () => {} : (() => props.fetchKPIDetails(Object.values(valueDriver)[0][0].kpiId[0], 'changeColor'))}>
																						{Object.values(valueDriver)[0][6].opKpi[0]}
																						<ReactTooltip  className="kpi-tooltip-align" id ={`${Object.values(valueDriver)[0][0].kpiId[0]}_${Object.values(valueDriver)[0][6].opKpi[0]}`}>
																								<span>{Object.values(valueDriver)[0][7].opKpiDesc[0]}</span><br/>
																								<span className="kpi-formula-tooltip">KPI Formula:</span> {Object.values(valueDriver)[0][8].opKpiFormula[0]} <br/>
																								<span className="kpi-type-tooltip">KPI Type: <span className="kpi-type-text-tooltip">{Object.values(valueDriver)[0][40].kpiType[0]=== 'NON_FINANCIAL'? 'Non-Financial': Object.values(valueDriver)[0][40].kpiType[0]=== 'FINANCIAL'? 'Financial' : ''}</span></span>
																						</ReactTooltip>
																					</span>

																				</div>
																			))
																		}
																	</div>}
																</div>
															))
														}
													</div>
												</div>
											))
										}
									</div>
								</div>
							))
							}
						</div>

					</div>
				))}
			</div>
			<div className="vdt-table-wrapper">
				{props.isBusinessCase ? "" :
					<VisualVDTTable operationalKpis={operationalKpis} oldKPIValues={oldKPIValues} />
				}
			</div>
		</div>
	);

}

export default ValueDriverTree;