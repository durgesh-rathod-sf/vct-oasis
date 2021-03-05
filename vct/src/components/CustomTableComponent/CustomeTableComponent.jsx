import React from 'react';
import { useTable } from 'react-table';
// import { columns, data } from './dataSource';
import './CustomTableComponent.css'
import { backgroundColor } from 'echarts/lib/theme/dark';

function App({columns,data}) {
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

  const ondecodeColor = (type) => {
  switch (type) {
    case 'onTarget' :
      return "#30c552"
      break;
      case 'offTarget' :
        return "#d81922"
        break; 
        case 'approximate' :
          return "#f9c60e"
      break;
       default :
        break;

  }
  }


  return (
    <table {...getTableProps()} id = "custom-table">
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
       
        {rows.map((row, i) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                if(cell.column.Header === 'Financial/Non-Financial Objective'){
                  if(i === 0){
                    return (<td {...cell.getCellProps()}>{cell.value}</td>)
                  }else if(!(rows[i-1].cells[0].value === rows[i].cells[0].value)){
                     return (<td {...cell.getCellProps()}>{cell.value}</td>)

                  }else{
                    return (<td className="mergeRowBorder" {...cell.getCellProps()}>{}</td>)
                  }

                }
                
                else{
                  return (<td {...cell.getCellProps()}>{cell.value.value !== undefined ? <div className="circle" style ={{backgroundColor: ondecodeColor(cell.value.value) }}></div> : (cell.value)}
                  </td>)
                }
                
               
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  );
}

export default App;