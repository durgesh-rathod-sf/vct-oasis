import React, { Component } from 'react';

className Breadcrumb extends Component {
    render(){
        const { page } = this.props;
        return(
            <div classNameName="row">
                {
                    page === 'contactus' && 
                    <div>
                        <div classNameName="col-sm-6">
                            <div>
                                <label classNameName="page-header-label">CONTACT US</label>
                            </div>
                            <div>
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb">
                                        <li className="breadcrumb-item" style={{cursor: 'pointer'}} onClick={this.redirectHandler}>Home</li>
                                        <li className="breadcrumb-item active" aria-current="page">Contact us</li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                        <div classNameName="col-sm-6 text-right">
                            <i classNameName="fa fa-close" onClick={this.redirectHandler} style={{color: '#ffffff', fontSize: '40px', cursor: 'pointer'}}></i>
                        </div>
                    </div>
                }
            </div>
        );
    }
}

export default Breadcrumb;