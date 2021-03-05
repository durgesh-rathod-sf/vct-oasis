import React, { Component } from 'react';
import './DashboardFilter.css';
import Select from 'react-select';
import MultiSelect from "react-multi-select-component";


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
    return (
      
          <div key={filter.id} className="dropdown form-group col-lg-12 col-md-6" >
            <h6 className='vdtLabel'>{filter.label}</h6>
              <div className="netBenefitOverview">
                {
                  filter.isMulti ?
                  <MultiSelect
                      className="multi-select"
                      options={filter.options}
                      value={filter.value}
                      onChange={(opt) => this.onSelectValue(opt, filter)}
                      labelledBy="Select"
                      disableSearch={true}
                      //placeholder={this.state.placeholder}
                      /*valueRenderer={filter.options !== undefined && filter.value !== undefined &&  
                                        filter.options !== null && filter.value !== null?
                                        filter.options.length === filter.value.length ?
                                        "All" : filter.value.length > 1 ?
                                          "Multiple Values" : "None" : ""
                                            }*/
                      ClearSelectedIcon
                  />
                  :
                  <Select
                  classNamePrefix="react-select"
                  closeMenuOnSelect={!filter.isMulti}
                  isMulti={filter.isMulti}
                  value={filter.value}
                  isSearchable={false}
                  //disableSearch={true}
                  components={{
                    IndicatorSeparator: () => null
                  }}
                  onChange={(opt) => this.onSelectValue(opt, filter)}
                  options={filter.options}
                ></Select>
                }
                
              </div>
          </div>
    )
  }

  render() {
    return (
      <div className="dashboard-filter">
        <div className="row"> 
           {  this.props.filters && this.props.filters.map(filter => this.renderFilter(filter))}
        </div>
      </div>
    );
  }
}

export default DashboardFilter;
