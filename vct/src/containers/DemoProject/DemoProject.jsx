import React, { Component } from 'react';
import { withRouter } from "react-router-dom";

class DemoProject extends Component {
    render(){
        return(
            <div className="container-fluid">
                <div className="row justify-content-center  ">                    
                    <h2>Demo Project</h2>                    
                </div>
                <div className="row justify-content-center  ">                                                           
                    <h5>Under Construction....</h5>
                </div>
            </div>
        )
    }
}

export default withRouter(DemoProject);