import React from 'react';

const MultipleNotificationMessage = ({ title, bodytext, icon }) => {
    let iconName = '';
    // eslint-disable-next-line default-case
    switch(icon){
        case 'success':
            iconName = <i className="fa fa-check"></i>;
            break;
        case 'error':
            iconName = <i className="fa fa-times"></i>;
            break;
    };

    function nextChar(c) {
        return String.fromCharCode(c.charCodeAt(0) + 1);
    }

    function errorMessage1() {
        let errorText =[];
        let typeHeadingCount = 0;
        //let errorText1 = "";
        for (let head1 in bodytext){
            let typeHeading = head1;
            let typeSubHeadingCount = 0;
            typeHeadingCount = typeHeadingCount + 1;
            //errorText = errorText +"Type " +typeHeadingCount +" : "+ typeHeading + " "
            errorText.push(<div><b>
                {`Type ${typeHeadingCount} : ${typeHeading}`}</b><br/></div>)

            for (let head2 in bodytext[head1]){
                let typeSubHeading = Object.keys(bodytext[head1][head2])
                typeSubHeadingCount = typeSubHeadingCount + 1
                //errorText = errorText + typeSubHeadingCount + " " + typeSubHeading  + " "
                errorText.push(<div style ={{marginLeft : '10px'}}>
                    {`${typeSubHeadingCount}. ${typeSubHeading}`}<br/></div>)

                for(let head3 in bodytext[head1][head2]){
                    let typeDetailMessageCount = 'a'
                    let typeDetailMessageArray= bodytext[head1][head2][head3]

                    for(let i = 0; i < typeDetailMessageArray.length ; i++){
                        //typeDetailMessageCount = typeDetailMessageCount + 1;
                        typeDetailMessageCount = i === 0 ? 'a' : nextChar(typeDetailMessageCount);
                        //errorText = errorText + typeDetailMessageCount + " " + typeDetailMessageArray[i]  + " "
                        errorText.push(<div style ={{marginLeft : '20px'}}>
                            {`${typeDetailMessageCount}. ${typeDetailMessageArray[i]}`}<br/></div>)
                        /*errorText1.push(<div>
                            {`Type ${typeHeadingCount} : ${typeHeading}`}<br/>
                            {`${typeSubHeadingCount}. ${typeSubHeading}`}<br/>
                            {`${typeDetailMessageCount}. ${typeDetailMessageArray[i]}`}
                            </div>)*/
                    }
                }
            }
        }
        return errorText;
    }
    let errorMessage = '';
    errorMessage = errorMessage1();

    return (
        <div>
            <div className="col-*" style={{fontFamily: 'Graphik', fontSize: '14px'}}>
			    <span>{iconName} {' '} {title}</span>
            </div>
            <div className="col-*" style={{fontFamily: 'Graphik', fontSize: '14px'}}>
                {/*bodytext && Object.keys(bodytext).map((text, index) => (
                <span>{(index+1) +":"+text}<br/></span>))*/}
                {errorMessage}
            </div>
        </div>
    );
};

export default MultipleNotificationMessage;