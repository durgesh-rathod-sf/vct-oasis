import React from 'react';
import '../../containers/NewProject/NewProject.css'
import Downshift from 'downshift';
import PlusIcon from "../../assets/newDealsIcons/addPlus.svg";
import deleteIco from "../../assets/newDealsIcons/trashdelete.svg";
import './ProjectUser.css';
import ReactTooltip from 'react-tooltip';
import calender from "../../assets/project/date_calender.svg";
import DatePicker from 'react-datepicker';

const ProjectUser = (props) => {
    const {
        projectUsers,
        addUserHandler,
        deleteUserHandler,
        onUserEmailChangeHandler,
        onUserAccessChangeHandler,
        onEndDateChange,
        userDetails,
        eId,
        accessType,
        masterMarked,
        loader,
        formattedProjectEndDate,
        enableAddButton,
        userTypeSelected,
        page
    } = props;

    return (
        <div className="container">
            {/* {
                projectUsers.map((user, index) => (
                    <div className="row" key={index}>
                        <div className="col-sm-7 form-group" style={{ paddingTop: index === 0 ? '0px' : '30px' }}>
                            {index === 0 && <label className="required-label">Users</label>}
                            <Downshift 
                                initialInputValue = {user['email_user' + index]}                          
                                key={index}
                                onChange={(selectedItem, event) => {
                                    onUserEmailChangeHandler(selectedItem, event);
                                }}
                                  itemToString={item => (item ? item.userEmail : '')}
                            >
                                {({
                                    getInputProps,
                                    getItemProps,
                                    getLabelProps,
                                    getMenuProps,
                                    isOpen,
                                    inputValue,
                                    highlightedIndex,
                                    selectedItem,
                                    getRootProps,
                                }) => ( 
                                        <div>
                                            <div
                                                style={{ display: 'inline-block' }}
                                                {...getRootProps({}, { suppressRefError: true })}
                                            >                                                
                                                <input {...getInputProps()}  className="form-control" style={{ height: 'auto', width: '165%', opacity: 1 }} />
                                            </div>
                                            <ul style={{ listStyleType: "none", marginLeft: "-40px" }} {...getMenuProps()}>
                                                {isOpen && userDetails
                                                    ? userDetails
                                                        .filter(item => !inputValue || item.userEmail.includes(inputValue))
                                                        .map((item, index) => (
                                                            <li value={item.userEmail}
                                                                {...getItemProps({
                                                                    key: item.userEmail,
                                                                    index,
                                                                    item,
                                                                    style: {
                                                                        cursor: 'pointer',
                                                                        paddingLeft: "10px",
                                                                        backgroundColor:
                                                                            highlightedIndex === index ? 'black' : '#3B3B3B',
                                                                        fontWeight: selectedItem === item ? 'bold' : 'normal',
                                                                    },
                                                                })}
                                                            >
                                                                {item.userEmail}
                                                            </li>
                                                        ))
                                                    : null}
                                            </ul>
                                        </div>
                                    )}
                            </Downshift>
                            <input
                                type="email"
                                className="form-control"
                                id={'email_user' + index}
                                placeholder="Email"
                                value={user['email_user' + index]}
                                onChange={onUserEmailChangeHandler}
                                style={{ height: 'auto', width: '90%', opacity: 1 }}
                            />
                            {/* {onEmailFieldClick === true ?
                                <select onSelect={onEmailSelect}>
                                    {filteredEmailArray && filteredEmailArray.map((user, index) => (
                                        <option value={user}> {user} </option>))}
                                </select> : ''} */}

            {/* </div>
                        <div className="col-sm-3 form-group" onChange={onUserAccessChangeHandler} style={{ paddingTop: '30px' }}>
                            <select defaultValue={user['access_user' + index]} className="form-control" id={'access_user' + index}>
                                <option value="Read">Read</option>
                                <option value="Write">Write</option>
                            </select>
                        </div>
                        <div className="col-sm-2" style={{ paddingTop: '25px', fontSize: '30px' }}>
                            <i
                                className="fa fa-trash"
                                style={{ cursor: 'pointer' }}
                                id={'delete_' + user['delete_index']}
                                onClick={deleteUserHandler}
                            />
                        </div>
                    </div>
                ))}  */}
            {/* <div className="row">
                <div className="col addUserDiv" onClick={addUserHandler}>
                    <i className="fa fa-user-plus"></i> {" "} {" "} Add user
                    </div>
            </div> */}

            {/* ////////////////////////////////////////////////////////////////////////// */}


            <table id="userTable" className="userTable">
                <thead>
                    <tr>
                        <th style={{ textAlignLast: "left", paddingLeft: "20px" }}>Users</th>
                        <th>Access type</th>
                        <th style={{ width: "100px" }}>Action</th>
                    </tr>
                    {/* Added a <tr> tag, as <th> cannot appear as a child of <thead> */}
                </thead>
                <tbody>
                    {/* row to Add new User starts */}
                    <tr >
                        <td>
                            <Downshift
                                // initialInputValue = {eId} 
                                selectedItem={eId}
                                // inputValaue  = {eId}               
                                // key={0}
                               /*  onChange={(selectedItem, event) => {
                                    userNameChangedFromAutoComplete();
                                }} */
                                itemToString={item => (item ? item.userEmail : '')}
                            >
                                {({
                                    getInputProps,
                                    getItemProps,
                                    getLabelProps,
                                    getMenuProps,
                                    isOpen,
                                    inputValue,
                                    highlightedIndex,
                                    selectedItem,
                                    getRootProps,
                                }) => (
                                        <div style={{ height: "50px" }}>
                                            <div
                                                style={{ display: 'inline-block' }}
                                                {...getRootProps({}, { suppressRefError: true })}
                                            >
                                                <input style={{ position: 'relative', width:'255px' }} {...getInputProps({ disabled: props.masterMarked ? true : props.loader ? true : false })}
                                                    placeholder="Add User" className="form-control form-input" onBlur={(e) => {onUserEmailChangeHandler(e.target.value)}}
                                                // style={{ height: "30px",opacity: 1,border:"none",backgroundColor:"#585757",marginLeft:"18px",marginTop:"8px" }}
                                                />
                                            </div>
                                            <ul style={{
                                                listStyleType: "none", marginLeft: "18px", paddingLeft: "0px",
                                                //  border: "0.5px solid #F0F0F0",
                                                width: "255px", height: userDetails.length > 0 && userDetails[0].userEmail.includes('Please select Account Name') ? '64px':"100px", overflowY: "auto", overflowX:"auto", position: 'absolute', zIndex:"1",
                                                backgroundColor: isOpen ? '#3B3B3B':''
                                            }} {...getMenuProps()}> 
                                            {isOpen && userTypeSelected === 'Accenture'? <li class="addUserOption" onClick={(e) => addUserHandler(e.target.value,'fromDropDown')}>Add User</li> : ''}                                                                                    
                                                {isOpen && userDetails.length === 1 && userDetails[0].userEmail.includes('Please select Account Name')
                                                    ?  <li value=''>Please select Account Name first, before adding Non Accenture User ID </li>
                                                    : isOpen && userDetails.length >1 ? userDetails
                                                    .filter(item => !inputValue || item.userEmail.includes(inputValue))
                                                    .map((item, index) => (                                                            
                                                        <li value={item.userEmail} className="list_projectUser"
                                                            {...getItemProps({
                                                                key: item.userEmail,
                                                                index,
                                                                item,
                                                                disabled: props.masterMarked ? true : props.loader ? true : false,
                                                                style: {
                                                                    cursor: 'pointer',

                                                                    paddingLeft: "10px",
                                                                    backgroundColor:
                                                                        highlightedIndex === index ? 'black' : '#3B3B3B',
                                                                    fontWeight: selectedItem === item ? 'bold' : 'normal',
                                                                },
                                                            })}
                                                        >
                                                            {item.userEmail}
                                                        </li>
                                                    )): null}
                                            </ul>
                                        </div>
                                    )}
                            </Downshift>
                        </td>

                        <td style={{ textAlign: "-webkit-center", textAlignLast: "center" }}>
                            <div className="form-group " onChange={onUserAccessChangeHandler} style={{ margin: "0px" }}>
                                <select
                                    value={accessType}
                                    /* Replaced 'value' attribute as 'defaultValue */
                                    className="form-control form-input"
                                    disabled={props.masterMarked ? true : props.loader ? true : false}
                                // style={{border:"0.5px solid #F0F0F0",width: "87px",height: "26px",backgroundColor:"#4D4D4D",color:"#FFFFFF",fontSize:"12px",lineHeight:"18px",padding:"0px"}}
                                // id={'access_user' + 0}
                                >
                                    <option value="Read">Read</option>
                                    <option value="Write">Write</option>
                                </select>
                            </div>
                        </td>
                        <td style={{ textAlign: "-webkit-center" }}>
                            <img src={PlusIcon} data-tip="" data-type="dark" data-for="add_user_tooltip" alt="add" style={{ cursor: props.masterMarked ? 'not-allowed' : props.loader ? 'not-allowed' : 'pointer' }} onClick={eId === "" ? 'return false;' : addUserHandler} 
                            className={eId === "" ? "disabled" : "return true;"} />                            
                            {/* onClick listener should be written as a function, like- onClick={()=> eId === "" ?...*/}
                            <ReactTooltip id="add_user_tooltip">
                                <span>Add user</span>
                            </ReactTooltip>
                        </td>
                    </tr>
                    {/* row to Add new User ends */}
                    {(projectUsers && (projectUsers.length > 0)) ?
                        (projectUsers.map((user, index) => (
                            <tr>
                                <td>
                                    <Downshift
                                        inputValue={user['email_user' + index]}
                                        key={index}
                                        onChange={(selectedItem, event) => {
                                            onUserEmailChangeHandler(selectedItem, event);
                                        }}
                                        itemToString={item => (item ? item.userEmail : '')}
                                    >
                                        {({
                                            getInputProps,
                                            getItemProps,
                                            getLabelProps,
                                            getMenuProps,
                                            isOpen,
                                            inputValue,
                                            highlightedIndex,
                                            selectedItem,
                                            getRootProps,
                                        }) => (
                                                <div>
                                                    <div
                                                        style={{ display: 'inline-block' }}
                                                        {...getRootProps({}, { suppressRefError: true })}
                                                    >
                                                        <input {...getInputProps({ disabled: props.masterMarked ? true : props.loader ? true : false })} className="{...getInputProps()}.l" className="form-control form-input"
                                                            disabled
                                                            style={{ backgroundColor: "#4D4D4D" , width:'255px'}}
                                                        />
                                                    </div>
                                                    <ul style={{ listStyleType: "none", marginLeft: "-40px" }} {...getMenuProps()}>
                                                        {isOpen && userDetails
                                                            ? userDetails
                                                                .filter(item => !inputValue || item.userEmail.includes(inputValue))
                                                                .map((item, index) => (
                                                                    <li value={item.userEmail}
                                                                        {...getItemProps({
                                                                            key: item.userEmail,
                                                                            index,
                                                                            item,
                                                                            disabled: props.masterMarked ? true : props.loader ? true : false,
                                                                            style: {
                                                                                cursor: 'pointer',
                                                                                paddingLeft: "10px",
                                                                                backgroundColor:
                                                                                    highlightedIndex === index ? 'black' : '#3B3B3B',
                                                                                fontWeight: selectedItem === item ? 'bold' : 'normal',
                                                                            },
                                                                        })}
                                                                    >
                                                                        {item.userEmail}
                                                                    </li>
                                                                ))
                                                            : null}
                                                    </ul>
                                                </div>
                                            )}
                                    </Downshift>
                                </td>
                                <td style={{ textAlign: "-webkit-center", textAlignLast: "center" }}>
                                    <div className="form-group " onChange={onUserAccessChangeHandler} style={{ margin: "0px" }}>
                                        <select
                                            value={user['access_user' + index]}
                                            className="form-control form-input"
                                            disabled={props.masterMarked ? true : props.loader ? true : false}
                                            id={'access_user' + index}
                                        >
                                            <option value="Read">Read</option>
                                            <option value="Write">Write</option>
                                        </select>
                                    </div>
                                </td>
                                <td style={{ textAlign: "-webkit-center" }}>
                                    <img src={deleteIco} alt="add"
                                        style={{ cursor: props.masterMarked ? 'not-allowed' : props.loader ? 'not-allowed' : 'pointer' }}
                                        id={'delete_' + user['delete_index']}
                                        data-tip=""
                                        data-for={'delete_tt' + user['delete_index']}
                                        data-type="dark"
                                        onClick={props.masterMarked ? 'return false;' : props.loader ? 'return false;' : deleteUserHandler} />
                                    <ReactTooltip id={'delete_tt' + user['delete_index']}>
                                        <span>Delete</span>
                                    </ReactTooltip>
                                </td>
                            </tr>
                        )))
                        :
                        null
                    }

                </tbody>
            </table>
        </div>
    );
}

export default ProjectUser;