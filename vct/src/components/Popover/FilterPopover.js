import React from 'react';
import Popover from 'react-tiny-popover'

import './Popover.css';

const FilterPopover = (props) => {
    return(
       <Popover
            isOpen={true}
            position={'right'} // preferred position
            content={<div className="card filter-popover">
                        <div className="card-body">
                            <ul>
                                {
                                    props.filterData.map((data, index) => (
                                        <li>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={props.checkedValue === 'select all' ? props.checkedStatus :
                                                        data.openDate === props.checkedValue ?
                                                            data.checked = props.checkedStatus : data.checked}
                                                    onClick={(event) => props.entryDateFilter(event, data.openDate, index)}
                                                />
                                                    <b>&nbsp;{data.openDate}</b>
                                            </label>
                                        </li>
                                    ))
                                }
                            </ul>
                            <div className="row justify-content-center">
                                <button type="button" className="btn btn-light filter-popover-btn"> OK </button>
                                <button type="button" className="btn btn-light filter-popover-btn"> Cancel </button>
                            </div>
                        </div>
                </div>
            }
        >
            {ref => (
                <div ref={ref}>
                
                </div>
            )}
        </Popover>
    );
};

export default FilterPopover;