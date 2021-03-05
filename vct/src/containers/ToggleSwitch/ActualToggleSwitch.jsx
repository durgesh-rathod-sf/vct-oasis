import React, { Component } from "react";
import './ActualToggleSwitch.css'
class ActualToggleSwitch extends Component {
    render() {
        return (
                <div className="row tab" style={{ justifyContent: 'flex-end', width: '100%' }}>
                    <input
                        // checked={isOn}
                        onChange={this.props.handleActualToggle}
                        className="react-switch-checkbox"
                        id={`react-switch-new`}
                        type="checkbox"

                    />
                    <label
                        className="react-switch-label"
                        htmlFor={`react-switch-new`}
                    >
                        <p style={{ margin: '35px', fontSize: '11px' }}>{this.props.view}</p>
                        <span className={`react-switch-button`} />
                    </label>
                </div> 
        );
    }
}

export default ActualToggleSwitch;