import React, { useState, useRef, useEffect, Fragment } from 'react';
import { MentionsInput, Mention } from 'react-mentions';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';

import StringFilter from './StringFilter';
import NotificationMessage from '../NotificationMessage/NotificationMessage';
import PreviewTable from '../PreviewTable/PreviewTable';
import PreviewImg from '../../assets/icons/preview.png';
import CloseImg from '../../assets/project/fvdt/crossIcon.svg';
import InfoIcon from '../../assets/project/fvdt/infoIcon.svg'; 

import CustomConfirmModal from '../../components/CustomConfirmModal/CustomConfirmModal';
import './FormulaBuilder.css';

const BenefitRuleBuilder = (props) => {
    const [formula, setFormula] = useState('');
	const [mentionsValue, setMentionsValue] = useState([]);
	const [rawFormula, setRawFormula] = useState('');
	const [showPreviewTable, setShowPreviewTable] = useState(false);
    const [plainTextRule, setPlainTextRule] = useState('');
    const [inValidCharacter, setInValidCharacter] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [ruleDataLoader, setRuleDataLoader] = useState(false);
    const [isBenefitRuleDefined, setIsBenefitRuleDefined] = useState(false);
    const [paramList, setParamList] = useState([]);
    const [operatorPressed, setOperatorPressed] = useState(false);
    const [customBenefitCloseModalVisible,setcustomBenefitCloseModalVisible] = useState(false);
    const [customBenefitCloseModalTitle,setcustomBenefitCloseModalTitle] = useState('');
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

    useEffect(() => {
        prevCountRef.current = mentionsValue;
    }, [mentionsValue]);

    useEffect(() => {
        setParamList(getFormattedData());
    }, [props.paramList]);

    useEffect(() => {
         if (isdelete) {
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
         if ( results.length > 0 && mentionsValue.length === mentionLength.length && !operatorPressed && !isNew ) {
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
        setRuleDataLoader(true);
        setParamList(getFormattedData());
        props.kpiBenefitsStore.getBenefitRuleData()
            .then((response) => {
                setRuleDataLoader(false);
                if(response && !response.error && response.data.resultCode === 'OK') {
                    setIsBenefitRuleDefined(response.data.resultObj.ruleDetail);
                    setFormula(findErrorInRule(response.data.resultObj.rule) + ' ');
                    setRawFormula(response.data.resultObj.rule);
                    props.kpiBenefitsStore.editBenefitRuleChange = false;
                    setShowPreviewTable(false);
                }else if(response && response.data.resultCode === 'KO'){
                    showNotification('error', response.data.errorDesription);
                    props.kpiBenefitsStore.editBenefitRuleChange = false;
                }
            });
            document.addEventListener('keypress', dropDownHandler, false);
    }, [props.kpiBenefitsStore.kpiId]);

    const findErrorInRule = (formulaStr) => {
        const formulaString = formulaStr.split('@');
        let error = false;
        for(let i = 0; i< formulaString.length; i++) {
            if(formulaString[i].indexOf('#REF') !== -1) {
                const newStr = formulaString[i].replace(/\[.*?\]\s?/g, '@[#REF]');
                error = true;
                formulaString.splice(i, 1, newStr);
            } else{
                formulaString.splice(i, 1, formulaString[i].replace(/\[/g, '@['));
            }
        }
        if (error) {
            showNotification('error', 'Benefit rule contains deleted parameter');
        }
        return formulaString.join('');
    };

    const dropDownHandler = (event) => {
        setShowPreviewTable(false);
        const k = event.keyCode;
        const keyCodes = [33, 34, 36, 37, 38, 39, 58, 59, 60, 61, 62, 63, 123, 124, 125, 126];
        if (k === 8 || keyCodes.includes(k)) {
            setInValidCharacter(true);
            return;
        }
        const opKeyCodes = [40, 41, 42, 43, 45, 47, 94];
        if(opKeyCodes.includes(k)) {
            setOperatorPressed(true);
            setSpace(false);
        }
    };

    const formulaHandler = (event, newValue, newPlainTextValue, mentions) => {
        setCursorStart(mentionsRef.current.selectionStart);
        setCursorEnd(mentionsRef.current.selectionEnd);
        // setMentionLength(mentions.length);
        const prevCount = prevCountRef.current;
        setMentionLength(prevCount);
        if(newValue.match(/[\/\+\-\*\.\^]{2}.*$/g)) {
             setCursorStart(mentionsRef.current.selectionStart);
             setCursorEnd(mentionsRef.current.selectionStart);
            // return;
        }
        // if (((newPlainTextValue !== "" && (/[\/\+\-\*\.\^].*$/.test(newPlainTextValue))) && mentions.length === 1)) {
        //     setCursorStart(0);
        //     setCursorEnd(0);
        // }
        if (['@ '].includes(newPlainTextValue)) {
            return;
        }
        const operators = ['+', '-', '/', '*', '^'];
        const plainFormula = newPlainTextValue.replace(/ +?/g, '');
        const secondLastChar = plainFormula.charAt(plainFormula.length - 2);
        const lastChar = plainFormula.charAt(plainFormula.length - 1);
        if (operators.includes(secondLastChar) && operators.includes(lastChar)) {
            return;
        }
        setIsBenefitRuleDefined(false);
        if (!inValidCharacter) {
            // const operatorAdded = newValue.replace(new RegExp('\\' + separators.join('|\\'), 'g'), ' $& ');
            setFormula(operatorPressed ? (newValue + ' ') : newValue);
            setRawFormula(newValue);
            setMentionsValue(mentions);
            setPlainTextRule(newPlainTextValue);
            props.kpiBenefitsStore.editBenefitRuleChange = true;
            setOperatorPressed(false);
            // setSpace(true);
            return;
        }
        setInValidCharacter(false);
    };

    const getFormattedData = () => {
        return props.paramList.map(param => ({
            id: param.id,
            display: param.paramName,
        }));
	};

const handleDeletBackspace = (event) =>{
    if(event.key === 'Delete'){
        setIsDelete(true);
        setCursorStart(event.target.selectionStart);
        setCursorEnd(event.target.selectionEnd);
        // setSpace(false)
    }
    else{
        setIsDelete(false);
        setSpace(true)
    }
}
	const saveRule = (event) => {
        event.preventDefault();
        let processedFormula = '';
        if (!isBenefitRuleDefined) {
            const stringFilter = new StringFilter(mentionsValue);
            const specialCharacters = ['+', '-', '*', '/', '^'];
            const lastCharacterIndex = plainTextRule.trimRight().length - 1;
            if (specialCharacters.includes(plainTextRule.charAt(lastCharacterIndex))) {
                showNotification('error', 'Please check the formula');
                return;
            }
            //This regex will replace all @[plaintex] with ""
            const filterFormula = rawFormula.replace(/@\[.*?\]/g, '');
            processedFormula = stringFilter.replaceWithBraces(filterFormula);
            if(!stringValidator(processedFormula)) {
                    return;
            }
        } else{
            processedFormula = isBenefitRuleDefined;
        }
        setShowLoader(true);
        props.kpiBenefitsStore.saveBenefitRule(processedFormula, rawFormula)
            .then((response) => {
                setShowLoader(false);
                if (response && !response.error) {
                    showNotification('success', 'Successfully saved Benefit rule');
                    props.kpiBenefitsStore.editBenefitRuleChange = false;
                    props.closeEditHandler('savenclose');
                } else {
                    showNotification('error', props.kpiBenefitsStore.saveError);
                    showPreviewHandler(event);
                }
            });
	};

	const showPreviewHandler = (event) => {
        event.preventDefault();
		if (formula !== '' && !showPreviewTable) {
            let processedFormula = '';
            if (!isBenefitRuleDefined) {
                const stringFilter = new StringFilter(mentionsValue);
                const filterFormula = formula.replace(/@\[.*?\]/g, '');
                processedFormula = stringFilter.replaceWithBraces(filterFormula);
                if(!stringValidator(processedFormula)) {
                    return;
                }
            } else {
                processedFormula = isBenefitRuleDefined;
            }
            setShowLoader(true);
			props.kpiBenefitsStore.getPreviewData(processedFormula, rawFormula)
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

    const stringValidator = (processedFormula) => {
        if (processedFormula.includes('}{')) {
            showNotification('error', 'Please add missing operator');
            return;
        }
        if (processedFormula.includes('}.{')) {
            showNotification('error', 'Please check formula');
            return;
        }
        if(processedFormula.match(/[a-zA-Z](?=(((?!\}).)*\{)|[^\{\}]*$)/g)) {
            showNotification('error', 'Please remove invalid text which is not parameter');
            return;
        }

        return true;
    };

    const showNotification = (type, message) => {
        if (type === 'error') {
            toast.error(<NotificationMessage
                title="Error"
                bodytext={message}
                icon="error"
            />, {
                    position: toast.POSITION.BOTTOM_RIGHT,
            });
            return;
        }
        toast.info(<NotificationMessage
                title="Success"
                bodytext={message}
                icon="success"
            />, {
                    position: toast.POSITION.BOTTOM_RIGHT,
            });
            return;
    };
    const openBenefitRuleModal = (title) => {
        setcustomBenefitCloseModalVisible(true);
        setcustomBenefitCloseModalTitle(title);
    }
    const closeBenefitRuleModal = (isYesClicked) =>{
        setcustomBenefitCloseModalVisible(false);
        setcustomBenefitCloseModalTitle("");
        if (isYesClicked) {
            //new delete function
           closeEditHandlerConfirm()
        } 
    }
    const closeEditHandlerConfirm = () => {
        props.closeEditHandler('close');
                props.kpiBenefitsStore.editBenefitRuleChange = false;
                return;
    }
    const closeEditHandler = () => {
        const message = 'You have not saved your data, are you sure you want to close?';
        if (formula !== '' && !isBenefitRuleDefined) {
            // if (window.confirm(message)) {}
            openBenefitRuleModal(message)
            return;
        }
        props.closeEditHandler('close');
    };
    // const updateparamList=()=>{

    //     setParamList(getFormattedData());
    // }

    return(
        <form>
            <div className="container benefit-rule-box">
                {
                    ruleDataLoader && <i style={{color: '#ffffff'}} className="fa fa-spinner fa-spin previewImgBtn"/>
                }
                {
                    !ruleDataLoader &&
                        <Fragment>
                            <div className="row justify-content-end" style={{borderBottom:"1px solid rgba(254, 254, 254, 0.05)",padding:"5px 0px 12px 0px",margin:"0px"}}>
                                <div className="col-sm-6 benRule-header">Edit Benefit Rule</div>
                                <div className="col-sm-6" style={{padding:"0px"}}>
                                <img src={CloseImg} alt="Close" className="close-icon" onClick={closeEditHandler}
                                  data-tip
                                  data-for="benfitRule-close-tooltip"
                                  data-place="right"/>
                                   <ReactTooltip id="benfitRule-close-tooltip" className="tooltip-class">
                                       <span>Close</span>
                                     </ReactTooltip>
                                </div>
                            </div>
                            <div className="row benefit-form-box" style={{margin:"0px"}}>
                                <div className="row form-row">
                                    <div className="col-sm-12" style={{margin:"0px",padding:"0px"}}>
                                        <label for="benefitRuleInput" className="benefit-formLabel">Benefit Rule</label>
                             </div >
                                    <div>
                                        <MentionsInput
                                            inputRef={mentionsRef}
                                            value={formula}
                                            onKeyDown={handleDeletBackspace}
                                            onChange={formulaHandler}
                                            // onClick={updateparamList}
                                            markup=' @[__display__](__id__) '
                                            className="mentions"
                                            style={{margin:"0%"}}
                                            placeholder={'Type @ to select parameters'}
                                            allowSpaceInQuery={true}
                                        >
                                            <Mention
                                                type="display"
                                                trigger="@"
                                                data={paramList}
                                                className="mentions__mention"
                                                appendSpaceOnAdd={true}
                                            />
                                        </MentionsInput>
                                        <small id="operandHelpBlock" class="form-text text-muted">
                                            <img src={InfoIcon} alt="info" style={{width:"12px",marginRight:"5px",alignSelf:"self-end"}}/>
                                            Note: Please add space after every operator and numbers. Operators allowed are: <br/>(, ), +, -, *, /, ^ 
                                        </small>
                                    </div>
                                </div>
                            </div>
                            {
                                showPreviewTable && <PreviewTable previewData={showPreviewTable} />
                            }
                            <div className="row justify-content-start" style={{margin:"0px"}}>
                                {
                                    showLoader && <i style={{color: '#ffffff',width:"auto"}} className="fa fa-spinner fa-spin previewImgBtn"/>
                                }
                                {
                                    !showLoader &&
                                        <div className="cr-de-btn-div" style={{width:"100%",padding:"0px",marginTop:"25px",marginBottom:"25px"}}>
                                             <button className="btn btn-primary button-dimenssions" 
                                            disabled={(formula === "") && (!isBenefitRuleDefined)?true:false}
                                             onClick={(event)=>saveRule(event)}>Save</button>
                                            <button className="btn btn-primary button-dimenssions" 
                                            disabled={(formula === "") && (!isBenefitRuleDefined)?true:false}
                                            onClick={(event)=>showPreviewHandler(event)}>Preview</button>
                                            {/* <span  >
                                               
                                                <img src={PreviewImg} alt="Preview" className="previewImgBtn" />
                                            </span>
                                           
                                            <span className="kpiBenifit-operationBtn" >
                                                
                                                <i className="fa fa-save" />
                                            </span> */}
                                        </div>
                                }
                            </div>
                        </Fragment>
                }
            </div>
            <CustomConfirmModal
                    ownClassName={'benefitRule_close'}
                    isModalVisible={customBenefitCloseModalVisible}
                    modalTitle={customBenefitCloseModalTitle}
                    closeConfirmModal={closeBenefitRuleModal}
                />
        </form>
    );
};

export default BenefitRuleBuilder;