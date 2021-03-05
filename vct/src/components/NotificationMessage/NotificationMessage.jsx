import React from 'react';

const NotificationMessage = ({ title, bodytext, icon }) => {
    let iconName = '';
    // eslint-disable-next-line default-case
    switch(icon){
        case 'success':
            iconName = <i className="fa fa-check"></i>;
            break;
        case 'error':
            iconName = <i className="fa fa-times"></i>;
            break;
            case 'warn':
                iconName = <i className="fa fa-warning"></i>;
                break;
    };
    return (
        <div>
            <div className="col-*" style={{fontFamily: 'Graphik', fontSize: '14px'}}>
			    <span>{iconName} {' '} {title}</span>
            </div>
            <div className="col-*" style={{fontFamily: 'Graphik', fontSize: '14px'}}>
                <span>{bodytext}</span>
            </div>
        </div>
    );
};

export default NotificationMessage;