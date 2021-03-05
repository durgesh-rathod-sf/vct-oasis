import React, { Fragment } from 'react';
import './CustomSelect.css';

const CustomSelect = (props) => {
    const { isCustomSelectOpen, customStatus,customCompletionPerc, customMilestoneStatus } = props;
    return (
        <Fragment >
            <div className={(customCompletionPerc===null || customCompletionPerc==="" )? "select-custom-disabled" : customMilestoneStatus ? "select-custom" : "select-custom"} onClick={(customCompletionPerc===null || customCompletionPerc==="" )? ()=>{} : customMilestoneStatus ? (e)=>props.onCustomStatusOpen(e,!isCustomSelectOpen) : (e)=>props.onCustomStatusOpen(e,!isCustomSelectOpen)} 
            >
                {(customStatus) || 'Select Status'}
            </div>
            {isCustomSelectOpen ?
                <div class="select-sim" id="select-color" >
                    <div class="options">

                       { customCompletionPerc===100 || customMilestoneStatus? <div class="option">
                            {/* <input type="radio" name="color" value="red" id="color-red" /> */}
                            <div className="color-box-wrap" onClick={props.onCustomSelectChange}>
                                <span className="color-box dark-green" />
                               Completed within due date
                            </div>
                        </div>:""
                        }
                        {customCompletionPerc===100 || customMilestoneStatus ? <div class="option">
                            {/* <input type="radio" name="color" value="red" id="color-red" /> */}
                            <div  className="color-box-wrap" onClick={props.onCustomSelectChange}>
                                <span className="color-box light-green" />
                               Completed after due date
                            </div>
                        </div>:""}

                       { (customCompletionPerc>0 && customCompletionPerc<100) || customMilestoneStatus ?<div class="option">
                            {/* <input type="radio" name="color" value="red" id="color-red" /> */}
                            <div onClick={props.onCustomSelectChange}  className="color-box-wrap">
                                <span className="color-box red" />
                                Delayed
                            </div>
                        </div>:""}

                       { (customCompletionPerc>0 && customCompletionPerc<100)?<div class="option">
                            {/* <input type="radio" name="color" value="red" id="color-red" /> */}
                            <div onClick={props.onCustomSelectChange} className="color-box-wrap">
                                <span className="color-box blue" />
                               In Progress
                            </div>
                        </div>
:""}
                       {customCompletionPerc===0?<div class="option">
                            {/* <input type="radio" name="color" value="red" id="color-red" /> */}
                            <div onClick={props.onCustomSelectChange} className="color-box-wrap" >
                                <span className="color-box grey" />
                               Not started
                            </div>
                        </div>:""}

                    </div>
                </div> : ""}
        </Fragment>

    )
}
export default CustomSelect;