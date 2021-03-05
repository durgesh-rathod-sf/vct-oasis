import React, { Fragment, useEffect, useState } from 'react';
import NumberFormat from 'react-number-format';
import ReactTooltip from 'react-tooltip';

const PreviewTable = (props) => {
    const { ruleInputs, result } = props.previewData;
    const [ruleData, setRuleData] = useState([]);
    useEffect(() => {
        const errorData = [];
        const validDataRule = [];
        for (let i = 0; i < ruleInputs.length; i++) {
            if (ruleInputs[i].error === 'Y') {
                errorData.push(ruleInputs[i]);
            } else {
                validDataRule.push(ruleInputs[i]);
            }
        }
        setRuleData(errorData.concat(validDataRule));
    }, []);

/*     function toFixedIfNecessary( value, dp ){
        if (value !== null) {
            return +parseFloat(value).toFixed( dp );
        }
        return '';
    } */

    function getErrorColumns() {
        const columnItems = [];
        for (let i = 0; i < 6; i++) {
            columnItems.push(<td style={{backgroundColor: '#ff8787'}} key={i} >#REF</td>);
        }

        return columnItems;
    }

    const getTooltipData = (value) => {
        if (value) {
            const val = String(value).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,');
            return `${val}`;
        }
    };
    return(
        <div className="row table-responsive kpi-table" style={{margin:"0px",marginTop:"25px"}}>
            <table className="table table-bordered table-sm preview-table">
                <thead style={{ whiteSpace: 'nowrap' }}>
                    <tr>
                        <th></th>
                        {
                            ruleData.length > 0 &&
                            ruleData[0].paramValues.map((param, index) => (
                                <th key={Math.random * (index + 1)}>{`Year ${param.year}`} </th>
                            ))
                        }
                    </tr>
                </thead>
                <tbody>
                    {ruleData.length > 0 &&
                        ruleData.map((data, index) => (
                            <Fragment>
                                <tr key={Math.random * (index + 1)}>
                                    {
                                        data.error === 'Y' &&
                                        getErrorColumns()
                                    }
                                </tr>
                                <tr key={Math.random * (index + 1)}>
                                    {
                                        data.error === 'N' && <td>{data.paramName}</td>
                                    }
                                    {
                                        data.error === 'N' && data.paramValues.map((param, paramIndex) => (
                                        <td key={paramIndex} data-tip={getTooltipData(param.paramValue)}>
                                            {param.error === 'Y' ? param.errorDetail :
                                                <Fragment>
                                            <NumberFormat
                                                disabled={true}
                                                thousandSeparator={true}
                                                // value={Number(param.paramValue)}
                                                value={(param.paramValue!== null)?Number(param.paramValue):''}
                                                className="number-format"
                                            />
                                            <ReactTooltip type="dark" html={true} thousandSeparator={true} />
                                            </Fragment>
                                                }
                                        </td>
                                    ))
                                    }
                                </tr>
                            </Fragment>
                        ))
                    }
                    {
                        result &&
                            <tr style={ {backgroundColor: result.error === 'Y' ? '#ff8787': '#5A5A5A'}}>
                                <td style={{backgroundColor: result.error === 'Y' ? '#ff8787': '#5A5A5A'}}>{result.paramName}</td>
                                {
                                    result.paramValues.map((resultParam, index) => (
                                        <td
                                        style={{backgroundColor: result.error === 'Y' ? '#ff8787': '#5A5A5A'}}
                                            key={index} index={index * Math.random()}
                                            data-tip={getTooltipData(resultParam.paramValue)}
                                        >
                                            {resultParam.error === 'Y' ? resultParam.errorDetail :
                                                <Fragment>
                                                    <NumberFormat
                                                        disabled={true}
                                                        thousandSeparator={true}
                                                        value={(resultParam.paramValue !==null)?Number(resultParam.paramValue):''}
                                                        className="number-format"
                                                    />
                                                    <ReactTooltip type="dark" html={true} thousandSeparator={true} />
                                                </Fragment>
                                            }
                                        </td>
                                    ))
                                }
                            </tr>
                    }
                </tbody>
            </table>
        </div>
    );
};

export default PreviewTable;