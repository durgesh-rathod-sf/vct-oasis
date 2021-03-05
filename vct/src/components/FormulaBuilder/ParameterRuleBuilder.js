import React, { useState, useRef, useEffect } from 'react';
import ReactTooltip from 'react-tooltip';
import { MentionsInput, Mention } from 'react-mentions';
import { toast } from 'react-toastify';
import './FormulaBuilder.css';
import StringFilter from './StringFilter';
import NotificationMessage from '../NotificationMessage/NotificationMessage';
import PreviewTable from '../PreviewTable/PreviewTable';
import CloseImg from '../../assets/project/fvdt/crossIcon.svg';
import InfoIcon from '../../assets/project/fvdt/infoIcon.svg';
import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
// import PreviewImg from '../../assets/icons/preview.png';

const ParameterRuleBuilder = (props) => {
    const [formula, setFormula] = useState('');
    const [paramName, setParamName] = useState('');
    const [paramOriName, setParamOriName] = useState('');
    const [paramUnit, setParamUnit] = useState('');
    const [paramNamesList, setParamNamesList] = useState([]);
    const [showPreviewTable, setShowPreviewTable] = useState(false);
    const [plainTextRule, setPlainTextRule] = useState('');
    const [inValidCharacter, setInValidCharacter] = useState(false);
    const [mentionsValue, setMentionsValue] = useState([]);
    const [rawFormula, setRawFormula] = useState('');
    const [showLoader, setShowLoader] = useState(false);
    const [isParamRuleDefined, setIsParamRuleDefined] = useState(false);
    const [paramList, setParamList] = useState([]);
    const [operatorPressed, setOperatorPressed] = useState(false);
    const [customCloseModalVisible,setCustomCloseModalVisible] = useState(false);
    const [customCloseModalTitle,setCustomCloseModalTitle] = useState('');
    const [cusrsorStart, setCursorStart] = useState(0);
    const [cusrsorEnd, setCursorEnd] = useState(0);
    const [mentionLength, setMentionLength] = useState(0);
    const [isdelete, setIsDelete] = useState(false);
    const [results, setResults] = useState([]);
    const [space, setSpace] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [newFormula, setNewFormula] = useState("");

    const mentionsRef = useRef(null);
    const prevCountRef = useRef();
    const kpiUnits = ['#', '$', '%', '#/$'];

    useEffect(() => {
        prevCountRef.current = mentionsValue;
    }, [mentionsValue]);

    useEffect(() => {
        setParamList(getFormattedData());
    }, [props.paramList]);

     useEffect(() => {
         if(paramName !== ''){
        setParamList(getFormattedDataAfterParamName());
         }
    }, [paramName]);

    useEffect(() => {
         if (isdelete === true) {
             mentionsRef.current.selectionStart = cusrsorStart;
             mentionsRef.current.selectionEnd = cusrsorEnd;
         }
         if ((mentionsValue.length > mentionLength.length) && (mentionLength.length > 0)) {
            setIsNew(false);
             let results1 = mentionsValue.filter(({ plainTextIndex: id1 }) => !mentionLength.some(({ plainTextIndex: id2 }) => id2 === id1));
             let copy = results1;
                         if (results1.length > 1) {
                             mentionsRef.current.selectionStart = results1[1]['plainTextIndex'];
                             mentionsRef.current.selectionEnd = results1[1]['plainTextIndex'];
                            copy[1]['plainTextIndex'] = Number(`${(copy[1]['plainTextIndex'])+1}`);
                            setCursorStart(copy[1]['plainTextIndex']);
                            setCursorEnd(copy[1]['plainTextIndex']);
                            results1 = [...copy];
                            setResults(results1);
             }else if(results1.length === 0){
                 setIsNew(true);
                 setResults([]);
                 setSpace(false);
             }
         }
         if (results.length > 0 && mentionsValue.length === mentionLength.length && !operatorPressed && !isNew ) {
             if(results.length>1){
                let mydata = mentionsValue;
                let copy = mydata;
            for(let [i,x] of copy.entries()){
              if(x['index'] === results[0]['index']){
                    copy[i+1]['plainTextIndex'] = results[1]['plainTextIndex']
              }
            }
            mydata = [...copy];
            setMentionsValue(mydata);
            let forTest = formula;
            let firstPart = forTest.substr(0, results[1]['index']+1);
            let lastPart = forTest.substr(results[1]['index']+1);
          
            let newString = firstPart + " " + lastPart;
            setNewFormula(newString);
            setIsNew(true);
            mentionsRef.current.selectionStart = results[1]['plainTextIndex'];
            mentionsRef.current.selectionEnd = results[1]['plainTextIndex'];
            setCursorStart(results[1]['plainTextIndex']);
            setCursorEnd(results[1]['plainTextIndex']);
        }else{
            setSpace(true);
        }
         }
        //  if((mentionsValue.length === mentionLength.length) &&
        //   (mentionLength.length>0) && (isdelete === true)){
        //      mentionsRef.current.selectionStart = cusrsorStart + 1;
        //      mentionsRef.current.selectionEnd= cusrsorEnd + 1 ;
        //  }
         if(results.length=== 0 && mentionsValue.length === mentionLength.length && !operatorPressed && !isNew && space){
           mentionsRef.current.selectionStart = cusrsorStart;
               mentionsRef.current.selectionEnd = cusrsorEnd;
       }
       if(results.length=== 0 && mentionsValue.length === mentionLength.length && !operatorPressed && !isNew && !space){
          mentionsRef.current.selectionStart = cusrsorStart+1;
              mentionsRef.current.selectionEnd = cusrsorEnd+1;
      }
    }, [formula]);

    useEffect( () => {
        if(isNew){
        setFormula(newFormula);
        // mentionsRef.current.selectionStart = results[1]['plainTextIndex'];
        // mentionsRef.current.selectionEnd = results[1]['plainTextIndex'];
        setResults([]);
        setIsNew(false);
    }
    }, [isNew,newFormula]);

    useEffect(() => {
        props.kpiBenefitsStore.getParamNames()
            .then((response) => {
                if (response && !response.error) {
                    if (response.length === 1) {
                        setParamName(response[0].paramId);
                        setParamOriName(response[0].paramName);
                        setParamUnit(response[0].paramUnit);
                        setIsParamRuleDefined(response[0].rule !== null && response[0].ruleDetail);
                        setFormula(response[0].rule !== null ? (findErrorInRule(response[0].rule, true) + ' ') : '');
                        setRawFormula(response[0].rule !== null ? findErrorInRule(response[0].rule, false) : '');
                        setShowPreviewTable(false);
                        props.kpiBenefitsStore.editParamRuleChange = false;
                    } else {
                        setFormula('');
                        setParamName('');
                        setParamOriName('');
                        setParamUnit('');
                        setShowPreviewTable(false);
                        props.kpiBenefitsStore.editParamRuleChange = false;
                    }
                    setParamNamesList(response);
                }
            });
        document.addEventListener('keypress', dropDownHandler, false);
    }, [props.kpiBenefitsStore.kpiId]);

    const dropDownHandler = (event) => {
        setShowPreviewTable(false);
        const k = event.keyCode;
        const keyCodes = [33, 34, 36, 37, 38, 39, 58, 59, 60, 61, 62, 63, 123, 124, 125, 126];
        if (k === 8 || keyCodes.includes(k)) {
            setInValidCharacter(true);
            return;
        }

        const opKeyCodes = [40, 41, 42, 43, 45, 47, 94];
        if (opKeyCodes.includes(k)) {
            setOperatorPressed(true);
            setSpace(false);
        }
    };
    const openParamRuleModal = (title) => {
        setCustomCloseModalVisible(true);
        setCustomCloseModalTitle(title);
    }
    const closeParamRuleModal = (isYesClicked) =>{
        setCustomCloseModalVisible(false);
        setCustomCloseModalTitle("");
        if (isYesClicked) {
            //new delete function
           closeEditHandlerConfirm()
        } 
    }
    const closeEditHandlerConfirm = () => {
        props.kpiBenefitsStore.editParamRuleChange = false;
        props.closeEditHandler('close');
        return;
    }
    const closeEditHandler = () => {
        const message = 'You have not saved your data, are you sure you want to close?';
        if (formula !== '' && !isParamRuleDefined) {
            // if (window.confirm(message)) {}
            openParamRuleModal(message)
            return;
        }
        props.closeEditHandler('close');
    };

    const formulaHandler = (event, newValue, newPlainTextValue, mentions) => {
        setCursorStart(mentionsRef.current.selectionStart);
        setCursorEnd(mentionsRef.current.selectionEnd);
        // setMentionLength(mentions.length);
        const prevCount = prevCountRef.current;
        setMentionLength(prevCount);
        if (newValue.match(/[\/\+\-\s\*\.\^]{2}.*$/g)) {
            setCursorStart(mentionsRef.current.selectionStart);
            setCursorEnd(mentionsRef.current.selectionStart);
            // return;
        }
        // if ((! /[\/\+\-\*\.\^].*$/.test(newPlainTextValue) && mentions.length === 1)) {
        //     setCursorStart(0);
        //     setCursorEnd(0);
        // }
        if (['@ '].includes(newPlainTextValue)) {
            return;
        }
        setIsParamRuleDefined(false);
        const operators = ['+', '-', '/', '*', '^'];
        const plainFormula = newPlainTextValue.replace(/ +?/g, '');
        const secondLastChar = plainFormula.charAt(plainFormula.length - 2);
        const lastChar = plainFormula.charAt(plainFormula.length - 1);
        if (operators.includes(secondLastChar) && operators.includes(lastChar)) {
            return;
        }
        if (!inValidCharacter) {
            setFormula(operatorPressed ? (newValue + ' ') : newValue);
            setRawFormula(newValue);
            setMentionsValue(mentions);
            setPlainTextRule(newPlainTextValue);
            setOperatorPressed(false);
            props.kpiBenefitsStore.editParamRuleChange = true;
            return;
        }
        setInValidCharacter(false);
    };

    const handleDeletBackspace = (event) =>{
        if(event.key === 'Delete'){
            setIsDelete(true);
            setCursorStart(event.target.selectionStart);
            setCursorEnd(event.target.selectionEnd);
        }else{
            setIsDelete(false);
            setSpace(true)
        }
    }

    const showPreviewHandler = (event) => {
         event.preventDefault();
        if (!paramName) {
            showNotification('error', 'Please select parameter');
            return;
        }
        if (formula !== '' && !showPreviewTable) {
            let processedFormula = '';
            if (!isParamRuleDefined) {
                const stringFilter = new StringFilter(mentionsValue);
                const filterFormula = formula.replace(/@\[.*?\]/g, '');
                processedFormula = stringFilter.replaceWithBraces(filterFormula);
                if (!stringValidator(processedFormula)) {
                    return;
                }
            } else {
                processedFormula = isParamRuleDefined;
            }

            setShowLoader(true);
            props.kpiBenefitsStore.getParamRulePreview(processedFormula, rawFormula, paramName, paramUnit)
                .then((response) => {
                    setShowLoader(false);
                    if (response && !response.error) {
                        setShowPreviewTable(response);
                        return;
                    }
                    showNotification('error', 'Please check the formula');
                    return;
                });
        }
        setShowPreviewTable(false);
    };

    const showNotification = (type, message) => {
        // eslint-disable-next-line default-case
        switch (type) {
            case 'error':
                toast.error(<NotificationMessage
                    title="Error"
                    bodytext={message}
                    icon="error"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT,
                });
                break;
            case 'success':
                toast.info(<NotificationMessage
                    title="Success"
                    bodytext={message}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT,
                });
                break;
            case 'warning':
                toast.error(<NotificationMessage
                    title="Info"
                    bodytext={message}
                    icon="success"
                />, {
                    position: toast.POSITION.BOTTOM_RIGHT,
                });
                break;
        }
    };

    const getFormattedData = () => {
        return props.paramList.map(param =>
            ({
                id: param.id,
                display: param.paramName,
            }));
    };

    const getFormattedDataAfterParamName = () => {
        return props.paramList.filter(function(el) { return el.paramId != Number(paramName); }).map(param =>
            ({
                id: param.id,
                display: param.paramName,
            }));
    };

    const paramNameHandler = (event) => {
        const selectedOption = event.target.value;
        setParamName(selectedOption);
        const selectedParam = paramNamesList.find(param => param.paramId === Number(selectedOption));
        setParamUnit(selectedParam.paramUnit);
        setParamOriName(selectedParam.paramName);
        setIsParamRuleDefined(selectedParam.rule !== null && selectedParam.ruleDetail);
        setFormula(selectedParam.rule !== null ? findErrorInRule(selectedParam.rule, true) : '');
        setRawFormula(selectedParam.rule !== null ? findErrorInRule(selectedParam.rule, false) : '');
        setShowPreviewTable(false);
    };

    const ParamUnitHandler = (event) => {
        const selectedOption = event.target.value;
        props.kpiBenefitsStore.editParamRuleChange = true;
        setParamUnit(selectedOption);
        setShowPreviewTable(false);
    };

    const findErrorInRule = (formulaStr, showError) => {
        const formulaString = formulaStr.split('@');
        let error = false;
        for (let i = 0; i < formulaString.length; i++) {
            if (formulaString[i].indexOf('#REF') !== -1) {
                const newStr = formulaString[i].replace(/\[.*?\]\s?/g, '@[#REF]');
                error = true;
                formulaString.splice(i, 1, newStr);
            } else {
                formulaString.splice(i, 1, formulaString[i].replace(/\[/g, '@['));
            }
        }
        if (error && showError) {
            showNotification('error', 'Parameter rule contains deleted parameter');
        }
        return formulaString.join('');
    };

    const saveRule = (event) => {
         event.preventDefault();
        if (!paramName) {
            showNotification('error', 'Please select parameter');
            return;
        }
        const specialCharacters = ['+', '-', '*', '/', '^'];
        const lastCharacterIndex = plainTextRule.trimRight().length - 1;
        if (specialCharacters.includes(plainTextRule.charAt(lastCharacterIndex))) {
            showNotification('error', 'Please add missing operator');
            return;
        }
        let processedFormula = '';
        if (!isParamRuleDefined) {
            const stringFilter = new StringFilter(mentionsValue);
            //This regex will replace all @[plaintex] with ""
            const filterFormula = rawFormula.replace(/@\[.*?\]/g, '');
            processedFormula = stringFilter.replaceWithBraces(filterFormula);
            if (!stringValidator(processedFormula)) {
                return;
            }
        } else {
            processedFormula = isParamRuleDefined;
        }
        setShowLoader(true);
        props.kpiBenefitsStore.saveParamRule(processedFormula, rawFormula, paramName, paramUnit, paramOriName)
            .then((response) => {
                setShowLoader(false);
                if (response && !response.error) {
                    showNotification('success', 'Successfully saved parameter rule');
                    props.kpiBenefitsStore.editParamRuleChange = false;
                    props.closeEditHandler('savenclose');
                } else {
                    showNotification('error', props.kpiBenefitsStore.saveError);
                    showPreviewHandler();
                }
            });
    };

    const stringValidator = (processedFormula) => {
        if (processedFormula.includes('}{')) {
            showNotification('error', 'Please add missing operator');
            return;
        }
        if (processedFormula.includes('}.{')) {
            showNotification('error', 'Please check formula');
            return;
        }
        if (processedFormula.match(/[a-zA-Z](?=(((?!\}).)*\{)|[^\{\}]*$)/g)) {
            showNotification('error', 'Please remove invalid text which is not parameter');
            return;
        }

        return true;
    };

    const suggestionHandler = (event) => {
        if (document.getElementsByClassName('mentions__suggestions').length > 0) {
            document.getElementsByClassName('mentions__suggestions')[0].style.display = 'none';
        }
    };
    // const updateparamList=()=>{

    //     setParamList(getFormattedData());
    // }

    return (
        <form>
            <div className="rule-box">
                <div className="row justify-content-end" style={{ borderBottom: "1px solid rgba(254, 254, 254, 0.05)", padding: "5px 0px 12px 0px", margin: "0px" }}>
                    <div className="col-sm-6 benRule-header">Edit Parameter Rule</div>
                    <div className="col-sm-6" style={{ padding: "0px" }}>
                        <img src={CloseImg} alt="Close" className="close-icon" onClick={closeEditHandler} 
                         data-tip
                         data-for="paramRule-close-tooltip"
                         data-place="right"/>
                          <ReactTooltip id="paramRule-close-tooltip" className="tooltip-class">
                              <span>Close</span>
                            </ReactTooltip>
                    </div>
                </div>
                <div className="param-form-box">
                    <div className="row form-row">
                        <div className="col-sm-8" style={{ paddingLeft: "0px" }}>
                            <label for="parameterNameInput" className="param-formLabel">Parameter Name</label>
                            <select className="form-control" value={paramName} onChange={paramNameHandler} id="parameterNameInput" onFocus={suggestionHandler}>
                                <option value="" disabled={true}>Select Parameter</option>
                                {
                                    paramNamesList.map((param) => (
                                        <option key={param.paramId} value={param.paramId}>{param.paramName}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="col-sm-4" style={{ paddingRight: "0px" }}>
                            <label for="parameterUnitInput" className="param-formLabel">Parameter Unit</label>
                            <select className="form-control" value={paramUnit}
                                onChange={ParamUnitHandler}
                                onFocus={suggestionHandler}
                            >
                                <option value="" disabled={true}>Select Unit</option>
                                {
                                    kpiUnits.map(kpiUnit =>
                                        <option >{kpiUnit}</option>)
                                }
                            </select>
                        </div>
                    </div>

                    <div className="row form-row">
                        <div className="col-sm-12" style={{ padding: "0px" }}>
                            <label for="parameterRuleInput" className="param-formLabel">Parameter Rule</label>

                            <MentionsInput
                                inputRef={mentionsRef}
                                value={formula}
                                onKeyDown={handleDeletBackspace}
                                onChange={formulaHandler}
                                // onClick={updateparamList}
                                markup='@[__display__](__id__)'
                                allowSpaceInQuery={true}
                                className="mentions"
                                placeholder={'Type @ to select parameters'}
                            >
                                <Mention
                                    trigger="@"
                                    data={paramList}
                                    className="mentions__mention"
                                    appendSpaceOnAdd={true}
                                />
                            </MentionsInput>
                            <small id="operandHelpBlock" class=" form-text text-muted" >
                                <img src={InfoIcon} alt="info" style={{ width: "12px", marginRight: "5px", alignSelf: "self-end" }} />
                            Note: Please add space after every operator and numbers. Operators allowed are: <br />(, ), +, -, *, /, ^
                            </small>
                        </div>
                    </div>
                </div>
                {
                    showPreviewTable && <PreviewTable previewData={showPreviewTable} />
                }
                <div className="row" style={{ margin: "0px" }}>
                    {
                        showLoader && <i style={{ color: '#ffffff',width:"auto" }} className="fa fa-spinner fa-spin previewImgBtn" />
                    }
                    {
                        !showLoader &&
                        // <Fragment>
                        //     <span data-tip="Preview" onClick={showPreviewHandler}>
                        //         <ReactTooltip type="dark" html={true} />
                        //         <img src={PreviewImg} alt="Preview" className="previewImgBtn" />
                        //     </span>
                        //     <span className="kpiBenifit-operationBtn" onClick={saveRule} data-tip="Save">
                        //         <ReactTooltip type="light" html={true} />
                        //         <i className="fa fa-save" />
                        //     </span>
                        // </Fragment>
                        <div className="cr-de-btn-div" style={{ width: "100%", padding: "0px", marginTop: "25px", marginBottom: "25px" }}>
                            <button
                                className="btn btn-primary button-dimenssions"
                                disabled={(paramNamesList.length===0) || (formula === "") && (!isParamRuleDefined)?true:false}
                                onClick={saveRule}>
                                Save
                                </button>
                            <button
                                className="btn btn-primary button-dimenssions"
                                disabled={(paramNamesList.length===0)|| (formula === "") && (!isParamRuleDefined)?true:false}
                                onClick={showPreviewHandler}>
                                Preview
                               </button>

                        </div>
                    }
                </div>
            </div>
            <CustomConfirmModal
                    ownClassName={'paramRule_close'}
                    isModalVisible={customCloseModalVisible}
                    modalTitle={customCloseModalTitle}
                    closeConfirmModal={closeParamRuleModal}
                />
        </form>
    );
};

export default ParameterRuleBuilder;