import React, {  Fragment } from 'react';

const DashboardDocuments = (props) => {
    return (<Fragment >
        {/* {editProjectId && <div key={Math.random()} className="col form-group"> */}
            <label htmlFor="ownerInput"  style={{marginLeft:'6%', fontWeight:'550'}}>Previous Files</label>
            {/* {editProjectId && templateFileVisible ? */}
           { props.templateArray && props.templateArray.length>0?
                (props.templateArray.map((template, index) => (


                    <div key={Math.floor(Math.random() * 1001)} className="row" style={{ backgroundColor: '#767676', fontSize: '16px', height: '36px', margin: '5px 0', borderRadius: '4px', paddingTop: '5px', marginLeft:'6%' }}>
                        <div className="col-sm-10">
                            {template.fileName.substr(0,40)}
                        </div>
                        <div className="col-sm-2">
                            <button key={Math.floor(Math.random() * 1001)} type="button" className="btn"  onClick={props.downloadFile}>
                                <i data-url={template.url} id={template.fileName} style={{ color: '#ffffff', fontSize: '18px' }} className="fa fa-arrow-down"></i>
                                {/* {
                            downloadBtn && <i className="fa fa-spinner fa-spin" style={{color: '#ffffff'}}></i>
                        } */}
                            </button>
                        </div>
                    </div>)
                )) :
                (
                    <div className="row" style={{ backgroundColor: '#767676', height: '36px', margin: '0.2%', borderRadius: '4px', paddingTop: '5px', paddingLeft: '10px', marginLeft:'6%', width:'111%' }}>
                        <h6>No file to download</h6>
                    </div>
                )}
        {/* </div>} */}
    </Fragment>)
}
export default DashboardDocuments; 