import React from "react";
import PropTypes from "prop-types";
import { default as ReactSelect } from "react-select";

const VDTMultiSelect = props => {
	const options = [...props.options];
  if (props.allowSelectAll) {
    return (
      <ReactSelect
        {...props}
		options={[props.allOption, ...props.options]}
		
        onChange={selected => {
			// console.log(selected);
          if (
            // selected !== null &&
            // selected.length > 0 &&
			selected.value === props.allOption.value
          ) {
            return props.onChange([...props.options, selected]);
		  }
		  else {
			return props.onChange(selected);
		  }
         
        }}
      />	
    );
  }

  return <ReactSelect {...props} />;
};

VDTMultiSelect.propTypes = {
  options: PropTypes.array,
  value: PropTypes.any,
  onChange: PropTypes.func,
  allowSelectAll: PropTypes.bool,
  allOption: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string
  })
};

VDTMultiSelect.defaultProps = {
  allOption: {
	value: "ALL",
    label: "ALL"
    
  }
};

export default VDTMultiSelect;
