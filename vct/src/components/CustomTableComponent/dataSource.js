export const columns = [
  {
    Header: 'Financial/Non-Financial Objective',
    accessor: 'objective',
  },
  {
    Header: 'KPI',
    accessor: 'kpi',
  },
  {
    Header: 'Status',
    accessor: 'status',
  },
  {
    Header: 'Actual Value',
    accessor: 'actualValue',
  },
  {
    Header: 'Target Value',
    accessor: 'targetValue',
  }
 ];

export const data = [
  {
    objective: 'Increase Revenue',
    kpi: 'Churn Rate',
    status: ({value: "onTarget"}),
    actualValue: 9.0,
    targetValue: 10.0,
    achievedYear: 9.0
  },
  {
    objective: 'Increase Revenue',
    kpi: 'Upsell Rate',
    status: ({value: "approximate"}),
    actualValue: 9.0,
    targetValue: 10.0,
    achievedYear: 9.0
  },
  {
    objective: 'Increase Revenue',
    kpi: 'Acceptance Rate %',
    status: ({value: "onTarget"}),
    actualValue: 85.0,
    targetValue: 84.3,
    achievedYear: 85.0
  },
  {
    objective: 'Increase Revenue',
    kpi: '# of Leads',
    status: ({value: "approximate"}),
    actualValue: 12000000,
    targetValue: 13600000,
    achievedYear: 12000000
  },
  {
    objective: 'Increase Revenue',
    kpi: 'Conversion %',
    status: ({value: "offTarget"}),
    actualValue: 22,
    targetValue: 23.3,
    achievedYear: 22
  },
  {
    objective: 'Drive Cost Reduction',
    kpi: 'Process Automation %',
    status: ({value: "offTarget"}),
    actualValue: 90,
    targetValue: 79,
    achievedYear: 76
  },
  {
    objective: 'Drive Cost Reduction',
    kpi: 'FTE Per Powerstation',
    status: ({value: "approximate"}),
    actualValue: 40,
    targetValue: 90,
    achievedYear: 89
  },
  {
    objective: 'Drive Cost Reduction',
    kpi: '% Faults Reported',
    status: ({value: "offTarget"}),
    actualValue: 10.0,
    targetValue: 8.0,
    achievedYear: 10.0
  },
  {
    objective: 'Improve Sustainability',
    kpi: 'Self Consumption Rate',
    status: ({value: "onTarget"}),
    actualValue: 11.0,
    targetValue: 11.0,
    achievedYear: 12.0
  },
  {
    objective: 'Improve Sustainability',
    kpi: 'Demand Flexiblity Ratio',
    status: ({value: "onTarget"}),
    actualValue: 1.1,
    targetValue: 1.0,
    achievedYear: 1.2
  },
  {
    objective: 'Improve Sustainability',
    kpi: 'Co2 Emissions',
    status:  ({value: "approximate"}),
    actualValue: 6.0,
    targetValue: 6.0,
    achievedYear: 6.2
  },
  {
    objective: 'Improve Sustainability',
    kpi: 'Water Foot Print',
    status: ({value: "onTarget"}),
    actualValue: 5.0,
    targetValue: 11.0,
    achievedYear: 12.0
  },
  {
    objective: 'Improve Stackholder experience',
    kpi: 'Customer Satisfaction Score',
    status: ({value: "offTarget"}),
    actualValue: 0.5,
    targetValue: 1.0,
    achievedYear: 2.0
  },
  {
    objective: 'Improve Stackholder experience',
    kpi: 'Compliance with SLA',
    status: ({value: "offTarget"}),
    actualValue: 1.0,
    targetValue: 5.0,
    achievedYear: 2.0
  },
  {
    objective: 'Improve Stackholder experience',
    kpi: 'Team Happiness Inded',
    status: ({value: "onTarget"}),
    actualValue: 12.0,
    targetValue: 12.0,
    achievedYear: 12.0
  }
];

/*  export const data = [{
  'Increase Revenue': [
  {kpi: 'Johnson',
        targetValue: 9,
        achievedYear: 'F',
      },
      {kpi: 'Upsell Rate',
        targetValue: 10.0,
        achievedYear: 9.0
      },{ kpi: 'Acceptance Rate %',
        targetValue: 84.3,
        achievedYear: 85.0
      }
      ]},{
     'Drive Cost Reduction': [
  {kpi: 'Johnson',
        targetValue: 9,
        achievedYear: 'F',
      },
      {kpi: 'Upsell Rate',
        targetValue: 10.0,
        achievedYear: 9.0
      },{ kpi: 'Acceptance Rate %',
        targetValue: 84.3,
        achievedYear: 85.0
      }
      ]},{
  'Improve Sustainability': [
  {kpi: 'Johnson',
        targetValue: 9,
        achievedYear: 'F',
      },
      {kpi: 'Upsell Rate',
        targetValue: 10.0,
        achievedYear: 9.0
      },{ kpi: 'Acceptance Rate %',
        targetValue: 84.3,
        achievedYear: 85.0
      }
      ]},	  
  ]  */


  
 