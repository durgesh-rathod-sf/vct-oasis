import React, { Component } from "react";
import './TargetToggleSwitch.css'
class ToggleSwitch extends Component {
    render() {
        return (
                <div className="row" style={{ justifyContent: 'flex-end', width: '95%' }}>
                    <input
                        // checked={isOn}
                        onChange={this.props.handleToggle}
                        className="react-switch-checkbox"
                        id={ this.props.source==='target'?`react-switch-test`:`react-switch-new`}
                        type="checkbox"

                    />
                    <label
                        className="react-switch-label"
                        htmlFor={ this.props.source==='target'?`react-switch-test`:`react-switch-new`}
                    >
                        <p style={{ margin: '35px', fontSize: '11px' }}>{this.props.view}</p>
                        <span className={`react-switch-button`} />
                    </label>
                </div> 
        );
    }
}

export default ToggleSwitch;