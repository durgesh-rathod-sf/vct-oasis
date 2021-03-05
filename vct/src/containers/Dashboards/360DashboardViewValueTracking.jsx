import React from 'react';
import "./ValueTrackingTabs.css";
import Charts from "./Charts"
import { inject } from 'mobx-react';
import CustomTableComponent from '../../components/CustomTableComponent/CustomeTableComponent';
import './360DashboardViewValueTracking.css';
import { columns, data } from '../../components/CustomTableComponent/dataSource';
import { useTable } from 'react-table';

@inject('dashboardViewStore')
class DashboardView extends React.Component {
    panelHeight = '650px';
    constructor(props){
        super()
        this.state = {
            load: true
        }
        
    }

    componentWillMount(){
    const {dashboardViewStore} = this.props;
    dashboardViewStore.initializeDashboard();
    }

    componentDidMount(){
        this.setPanelHeight();
        this.setState({state: false})       
    }

    setPanelHeight  = () => {
        this.panelHeight =  document.getElementById("TableView360").clientHeight + 100
    }
    render(){
        const { dashboardViewStore} = this.props;
        return(
            <div className="pl-3 pr-3 position-relative w-100">

            <div className="row">
                <div className="col-lg-1 col-xl-1 mt-3" >
                   
                </div>
                {/* {dashboardViewStore.loader === false ? */}
                    <div className="col-lg-11 col-xl-11">
                        
                        <div className="form-group row">                            
                                <div className="col-lg-6 pl-lg-0">
                                    <Charts chart={dashboardViewStore.charts} page="360View"></Charts>
                               </div>                               
                                    <div className="col-lg-6 pl-lg-0">
                                        <div className="tablePanel" style={{ height: this.panelHeight}}>
                                            <span className="p10" style={{fontSize: '16px'}}> Representative KPIs</span>
                                            <div id="TableView360" onLoad={this.setPanelHeight}>
                                                <CustomTableComponent getTableProps={this.props.getTableProps} columns = {columns} data ={data} getTableBodyProps={this.props.getTableBodyProps} headerGroups={this.props.headerGroups} rows={this.props.rows}
      prepareRow={this.props.prepareRow}/>   
                                            </div>
                                        
                                        </div>
                                    
                                    </div>                            
                        </div>

                    </div> 
                   {/*  : <div className="row  spinner-div" style={{ display: "flex", justifyContent: "center", height: '50px' }}>

                        <i className="fa fa-spinner fa-spin" style={{ fontSize: '18px', color: '#ffffff', height: "min-content" }}></i>
                    </div> */}
               {/*  } */}

            </div>
        </div>
        )}
}

//export default DashboardView;

/**
 * For using custom table need to use below code structure for framing table using useTable(columns,data)
 * Inside return statement call the React component to be rendered as below.
 * From the React Component call CustomTableComponent and pass props values as below eg:
 *    eg: CustomTableComponent getTableProps={this.props.getTableProps} getTableBodyProps={this.props.getTableBodyProps} headerGroups={this.props.headerGroups} rows={this.props.rows}
      prepareRow={this.props.prepareRow}/>   
 */
export default () => {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
      } = useTable({
        columns,
        data,
      });

    return(
    <DashboardView getTableProps={getTableProps} getTableBodyProps={getTableBodyProps} headerGroups={headerGroups} rows={rows}
    prepareRow={prepareRow}></DashboardView>
    )
}