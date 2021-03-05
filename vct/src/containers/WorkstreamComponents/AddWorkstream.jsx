import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
import { observer, inject } from 'mobx-react';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import NotificationMessage from '../../components/NotificationMessage/NotificationMessage';
import circPlusIcon from "../../assets/project/iActuals/add-plus-circle.svg";
import trashIcon from '../../assets/project/viewDeals/trash-delete-icon.svg';
import './AddWorkstream.css';
var SessionStorage = require('store/storages/sessionStorage');

@inject('workstreamStore')
class AddWorkstream extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addWsArray: [],
            addWsError: ''
        };

        this.makeInputHandler = this.makeInputHandler.bind(this);
        this.saveWorkstreamNameHandler = this.saveWorkstreamNameHandler.bind(this);
        this.updateWsNamevalue = this.updateWsNamevalue.bind(this);
        this.deleteWorkstreamRow = this.deleteWorkstreamRow.bind(this);
    }

    componentDidMount() {

        const { workstreamStore } = this.props;
        let addwsArr = [...workstreamStore.addWorkstreamArray];

        this.setState({
            addWsArray: [...addwsArr]
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.addWorkstreamArray !== this.props.addWorkstreamArray) {
            this.test()
        }
    }
    test() {
        const { workstreamStore } = this.props;
        let addwsArr = [...workstreamStore.addWorkstreamArray];

        this.setState({
            addWsArray: [...addwsArr]
        });
    }

    makeInputHandler = (e, ind) => {
        let { addWsArray } = this.state;
        addWsArray[ind].isInputEnabled = true;
        this.setState({
            addWsArray: [...addWsArray]
        })
    }

    fetchAllWSDetails() {
        this.props.fetchAllWsDetails();
    }

    saveWorkstreamNameHandler = (event, ind) => {
        const { workstreamStore } = this.props;
        let { addWsArray } = this.state;

        if (addWsArray[ind].workstreamName.length > 0 && !RegExp(/[<>!'"[\]]/).test(event.target.value)) {
            const payloadObj = {
                'mapId': SessionStorage.read('mapId'),
                'name': addWsArray[ind].workstreamName.trim()
            }
            workstreamStore.saveWorkstreamDetails(payloadObj)
                .then((response) => {
                    if (!response.error && response.data.resultCode === 'OK') {
                        addWsArray.splice(ind, 1);
                        workstreamStore.addWorkstreamArray.splice(ind, 1);
                        this.fetchAllWSDetails();
                        this.setState({
                            addWsArray: [...addWsArray]
                        });
                        this.showErrorNotification("New Workstream saved successfully", "Success", "success");

                    } else if (!response.error && response.data.resultCode === 'KO') {
                        console.log(response.data.errorDescription);
                        this.showErrorNotification(response.data.errorDescription, "Error", "error");
                    } else {

                    }
                });
        } else {
            this.showErrorNotification("Please enter valid value and try again", "Error", "error");
            console.log('error: ws name should not be empty');
        }


    }

    updateWsNamevalue = (event, ind) => {
        let { addWsArray } = this.state;
        const wsName = event.target.value;
        const errors = !RegExp(/[<>!'"[\]]/).test(event.target.value) ? '' : 'Please enter valid workstream name. Special characters [ < ! \' " > ] are invalid';
        addWsArray[ind].workstreamName = wsName;
        this.setState({
            addWsArray: [...addWsArray],
            addWsError: errors
        })
    }

    deleteWorkstreamRow = ((e, ind) => {
        let { workstreamStore } = this.props;
        let { addWsArray } = this.state;
        addWsArray.splice(ind, 1);
        workstreamStore.addWorkstreamArray.splice(ind, 1);
        this.setState({
            addWsArray: [...addWsArray]
        });
    })

    showErrorNotification = (message, title, type) => {
        if (type === 'error') {
            toast.error(<NotificationMessage
                title={title}
                bodytext={message}
                icon={type}
            />, {
                position: toast.POSITION.BOTTOM_RIGHT
            });
        }
        if (type === 'success') {
            toast.info(<NotificationMessage
                title={title}
                bodytext={message}
                icon={type}
            />, {
                position: toast.POSITION.BOTTOM_RIGHT
            });
        }

    }

    handleKeyDown = (e, ind) => {
        if (e.key === 'Enter') {
            this.saveWorkstreamNameHandler(e, ind);
        }
    }

    render() {

        const { addWsArray } = this.state;
        // const {workstreamStore} = this.props

        return (
            <div className="add-workstream-tab">
                {addWsArray && addWsArray.map((addws, ind) => (
                    <div key={ind} className="add-workstream row">
                        <div className='col-md-4'>
                            <div className="ws-icon-input">
                                {/* <div className="ws-icon icon-disabled">
                                <i className="fa fa-plus text-left"></i>
                            </div> */}
                                <div className="ws-input-div">
                                    {addws.isInputEnabled ?
                                        <div>
                                            <input type='text' className="workstream-input"
                                                value={addws.workstreamName}
                                                maxLength="50"
                                                autoFocus={true}
                                                placeholder={'Add Workstream'}
                                                onChange={(e) => { this.updateWsNamevalue(e, ind) }}
                                                onKeyDown={(e) => { this.handleKeyDown(e, ind) }}
                                                style={{ cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer' }}
                                                disabled={SessionStorage.read("accessType") === "Read" ? true : false}
                                            >
                                            </input>
                                            <img src={circPlusIcon} alt="add" className="add-ws-plus"
                                                data-tip="" data-for="add_w_tooltip" data-type="dark"
                                                style={{
                                                    opacity: SessionStorage.read("accessType") === "Read" ? "0.5" : 'unset',
                                                    cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer'
                                                }}
                                                onClick={SessionStorage.read("accessType") === "Read" ? () => { } : (e) => { this.saveWorkstreamNameHandler(e, ind) }}></img>
                                            <ReactTooltip id="add_w_tooltip">
                                                <span>Add</span>
                                            </ReactTooltip>
                                            <br></br><span style={{ color: '#ffffff' }}><small>{this.state.addWsError}</small></span>
                                        </div>
                                        : <span>
                                            <label onDoubleClick={(e) => { this.makeInputHandler(e, ind) }}>
                                                {addws.workstreamName.length > 0 && !RegExp(/[<>!'"[\]]/).test(addws.workstreamName) ?
                                                    <span className="ws-name">{addws.workstreamName}</span>
                                                    : <span className="ws-placeholder">Add Workstream</span>
                                                }
                                            </label>
                                            <img src={circPlusIcon} alt="add" className="add-ws-plus"
                                                data-tip="" data-for="add_w_tooltip" data-type="dark"
                                                style={{ opacity: SessionStorage.read("accessType") === "Read" ? "0.5" : 'unset', cursor: SessionStorage.read("accessType") === "Read" ? "not-allowed" : 'pointer' }}
                                                onClick={() => { }}></img>
                                            <ReactTooltip id="add_w_tooltip">
                                                <span>Add</span>
                                            </ReactTooltip>
                                        </span>
                                    }

                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">

                        </div>
                        <div className="col-md-4">

                        </div>
                        <div className="col-md-1 text-right">
                            <img src={trashIcon} alt="delete"
                                data-tip="" data-for="del_w_tooltip" data-type="dark" data-place="left"
                                onClick={(e) => { this.deleteWorkstreamRow(ind) }}></img>
                            <ReactTooltip id="del_w_tooltip">
                                <span>Delete</span>
                            </ReactTooltip>
                        </div>

                    </div>
                ))

                }



            </div>

        )
    }
}

export default withRouter(AddWorkstream);