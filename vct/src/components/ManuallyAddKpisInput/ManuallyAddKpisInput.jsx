import React from 'react';
var SessionStorage = require('store/storages/sessionStorage');

const ManuallyAddKpisInput = (props) => {
    const {
        cancelVDTHandler,
        saveVDTHandler,

    } = props;

    return (
        <div className="container" style={{ paddingLeft: '0px' }}>
            <div className="col-sm-12" style={{ paddingTop: '2%' }}>
                <button
                    className="btn btn-light float-right"
                    onClick={saveVDTHandler} style={{ fontWeight: '600' }}
                    disabled={SessionStorage.write('accessType') === 'Read'}
                >
                    Save
                    </button>
                <button
                    className="btn btn-light float-right"
                    onClick={cancelVDTHandler} style={{ marginLeft: '2%', marginRight: '2%', fontWeight: '600' }}

                >
                    Cancel
                </button>

            </div>
        </div>
    );
}

export default ManuallyAddKpisInput;