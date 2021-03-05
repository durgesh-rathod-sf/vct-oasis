import React, { Component } from 'react';
import './DashboardFilter.css';
import Select from 'react-select';


class DashboardFilter extends Component {
  /*constructor(props, ctx) {
    super(props, ctx);
    this.onSelectValue = this.onSelectValue.bind(this);
  }*/
  componentDidMount() {

  }

  onSelectValue(selectedOption, filter) {
    filter.value = selectedOption;
    this.props.filterChange(selectedOption, filter);
    //this.forceUpdate();
  }

  renderFilter(filter) {
    return (<div key={filter.id} className="dropdown pl-2 m-0 mt-2" >
      <label className="" >{filter.label}</label>
      <div className="">
        <Select
          classNamePrefix="react-select"
          closeMenuOnSelect={!filter.isMulti}
          isMulti={filter.isMulti}
          value={filter.value}
          onChange={(opt) => this.onSelectValue(opt, filter)}
          options={filter.options}
        ></Select>
      </div>
    </div>)
  }

  render() {
    return (
      <div className="dashboard-filter">
        {  this.props.filters && this.props.filters.map(filter => this.renderFilter(filter))}
      </div>
    );
  }
}

export default DashboardFilter;
