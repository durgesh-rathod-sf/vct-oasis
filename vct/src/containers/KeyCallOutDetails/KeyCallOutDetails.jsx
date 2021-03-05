import React from 'react';

const KeyCallouts = (props) => {
    const {
        keyCallOutsList,
        onKeyCalloutChangeHandler,
        addKeyCallOutHandler,
        deleteUserHandler
    } = props;

    return (
        <div className="container">
            {keyCallOutsList && keyCallOutsList.map((keyCallout, index) => (
                <div className="row" key={index} >
                    <div className="col-sm-7 form-group" style={{ paddingTop: index === '0px',  fontWeight:'550' }}>
                        {index === 0 && <label>KeyCallouts</label>}
                        <input
                            type="details"
                            className="form-control"
                            id={'details' + index}
                            placeholder="Add Key Callouts"
                            value={keyCallout['details' + index]}
                          onChange={onKeyCalloutChangeHandler}
                        />
                    </div>
                    <div className="col-sm-2" style={{fontSize: '30px', paddingTop:'0px', marginTop:index===0?'5%':''}}>                            
                            <i 
                                className="fa fa-trash" 
                                style={{cursor: 'pointer'}} 
                            value={keyCallout['details' + index]}
                                id={'delete_' + keyCallout['delete_index'] } 
                                onClick={deleteUserHandler}
                            />
                        </div>

                </div>))}
            <div className="row" style={{width:'57%', marginLeft:'0px'}}>
                <div className="col addUserDiv"onClick={addKeyCallOutHandler}>
                    <i className="fa fa-user-plus"></i> {" "} {" "} Add keycallouts
                        </div>
            </div>
        </div>
    );
}

export default KeyCallouts;