import { observable, action } from "mobx";
// import { Auth } from 'aws-amplify';
import DashboardHelper from '../../helpers/DashboardHelper/DashboardHelper';
import { toJS } from "mobx";

export default class DashboardViewStore {
    @observable charts = {};
    @observable loader = false;

    data = [{
        name:'360° View',
        itemStyle: {
            color: 'transparent'
        },
        children:[{
            name: 'Experience',
            itemStyle: {
                color: '#6694ff'
            },
            children: [{
                name: 'Customer',
                value: 1,
                itemStyle: {
                    color: '#6694ff'
                }
            }, {
                name: 'Employee',
                itemStyle: {
                    color: '#6694ff'
                },
               value: 1
            }, {
                name: 'Custom',
                itemStyle: {
                    color: '#6694ff'
                },
                value: 1
            }]
        }, {
            name: 'Sustainablity',
            itemStyle: {
                color: '#e4a1ff'
            },
            children: [{
                name: 'Environmental',
                itemStyle: {
                    color: '#e4a1ff'
                },
                value: 1
            }, {
                name: 'Social',
                itemStyle: {
                    color: '#e4a1ff'
                },
               value: 1
            }, {
                name: 'Governance',
                itemStyle: {
                    color: '#e4a1ff'
                },
                value: 1
            }, {
                name: 'Custom',
                itemStyle: {
                    color: '#e4a1ff'
                },
                value: 1
            }]
        }, {
            name: 'Talent',
            itemStyle: {
                color: '#909090'
            },
            children: [{
                name: 'Custom',
                itemStyle: {
                    color: '#909090'
                },
                value: 1
            }, {
                name: 'Development',
                itemStyle: {
                    color: '#909090'
                },
                value: 1
            }, {
                name: 'Retention',
                itemStyle: {
                    color: '#909090'
                },
                value: 1
            }]
        }, {
            name: 'Inclusion & Diversity',
            itemStyle: {
                color: '#e4a1ff'
            },
            children: [{
                name: 'Custom',
                value: 1,
                itemStyle: {
                    color: '#e4a1ff'
                }
            }, {
                name: 'Workforce Diversity',
                value: 1,
                itemStyle: {
                    color: '#e4a1ff'
                }
            }, {
                name: 'Gender Equality',
                itemStyle: {
                    color: '#e4a1ff'
                },
                value: 1
            }]
            }, {
            name: 'Custom',
                itemStyle: {
                color: '#909090'
            },
            children: [{
                name: 'Customer Business Objective',
                itemStyle: {
                    color: '#909090'
                },
                value: 1
            }]

        }, {
            name: 'Financial',
            itemStyle: {
                color: '#909090'
            },
            children: [{
                name: 'Capital',
                itemStyle: {
                    color: '#909090'
                },
                value: 1
            }, {
                name: 'Opex',
                itemStyle: {
                    color: '#909090'
                },
                value: 1
            }, {
                name: 'Revenue',
                itemStyle: {
                    color: '#909090'
                },
                value: 1
            }, {
                name: 'Custom',
                itemStyle: {
                    color: '#909090'
                },
                value: 1
            }]
        
        }]
           } ];
    
    charts = {
        label: '360° Value Map',
        data : {
            backgroundColor: 'transparent',
            series: [{
                type: 'sunburst',
                data: this.data,
                sort: null,
                levels: [{
                },
                    {
                    r0: '10%',
                    r: '22%',
                    itemStyle: {
                        borderWidth: 0
                    },
                    label: {
                        position:'inside',
                        rotate: 'rotational',
                        padding: [
                            5,  // up
                            10, // right
                            50,  // down
                            10, // left
                        ]
                    }
                }, {
                    r0: '18%',
                    r: '54%',
                    itemStyle: {
                        borderWidth: 2
                    },
                    label: {
                        position:'inside',
                        formatter: function (param) {
                            var depth = param.data.name.length;
                            if (depth > 10) {
                                param.data.name = param.data.name.substring(0,10)+'...';
                                return param.data.name;
                    }
                            
                        }
                    }
                },{
                    r0: '54%',
                    r: '99%',
                    itemStyle: {
                        borderWidth: 2
                    },
                    label: {
                        position: 'inside',
                        align: 'right',
                        formatter: function (param) {
                            var depth = param.data.name.length;
                            if (depth > 10) {
                                param.data.name = param.data.name.substring(0,10)+'...';
                                return param.data.name;
                    }

                        }
                    }
                }]
            }


            ]
    }
        
    };
    
    
    
    @action
    initializeDashboard(){

    }
}
