/**
 * @Author    tina
 * @DateTime  2018-12-3
 * @copyright 数据清洗
 */
import React, { Component } from 'react';
import { Input, Tooltip, Checkbox } from 'antd';
import { regularBuilder } from '@/utils/utils';
import { formatMessage, FormattedMessage } from 'umi/locale';
import styles from './index.less';
import BraftEditor from 'braft-editor';
import { QUESTION_SHOW_RICHTEXT } from '@/frontlib/utils/utils';
import 'braft-editor/dist/index.css'
// 'separator',
const controls = [
  'undo', 'redo', 'separator',
  'font-size', 'line-height', 'letter-spacing', 'separator',
  'text-color', 'bold', 'italic', 'underline', 'strike-through', 'separator',
  'superscript', 'subscript', 'remove-styles',  'separator', 'text-indent', 'text-align', 'separator',
  'headings', 'list-ul', 'list-ol', 'blockquote', 'code', 'separator', 'hr', 
  'clear'
]
const { TextArea } = Input;
class TextareaClearData extends Component {
  constructor(props) {
    super(props);
    const { textlabel,initvalue } = this.props;
    this.state = {
      visible: false,
      allowClear: props.autocleaning ? (props.autocleaning == 'Y') || props.autocleaning == 'true' ? true : false : '',
      autoClear: props.autocleaning ? (props.autocleaning == 'Y'||props.autocleaning == 'N') ? true : false : '',
      tip: <FormattedMessage id="app.auto.revising.tips" values={{name:textlabel}} defaultMessage="正在对{name}进行自动修订…"></FormattedMessage>,
      allowEnter: props.allowEnter ? props.allowEnter : false,
      allowClearEnter: false,
      editorState: BraftEditor.createEditorState(initvalue),
    };
  }

  componentDidMount() {}

  onChange = (e) => {
    const {props} = this;
    const { allowClear } = this.state;
    props.onChange(e.target.value,"change");
    if (allowClear) {
      props.saveClear(false)
    }
  }

  clearDataBlur = (e) => {
    const that = this
    let initvalue = e.target.value;
    const { allowClear, allowClearEnter } = this.state;
    console.log(allowClear+'=========='+allowClearEnter)
    if (allowClearEnter&&allowClear) {
      initvalue = initvalue.replace(/^\n+|\n+$|^\s+\n+|\s+\n+$|\n+\s+$|\n+$/g,"")
     
      let firstIndex = initvalue.match(/^\s+/g) && initvalue.match(/^\s+/g)[0].replace(/\s/g, "space-")
      initvalue = initvalue.replace(/\n/g, "enter-").replace(/^\s+/g, firstIndex)
      let initString = initvalue.split(/enter-\s+/g)
      let initMatch = initvalue.match(/enter-\s+/g)||[]
   
      initMatch.map((vo, index) => {
        initMatch[index] = vo.replace(/\s/g, "space-")
      })
      let resultInit = ''
      initString.map((item, index) => {
        resultInit += item
        resultInit += initMatch[index] ? initMatch[index] : ''
      })
      initvalue = resultInit
    }
    if (initvalue && allowClear) {
      that.setState({
        visible: true
      })
      const { textlabel } = this.props;
      this.setState({
        tip: <FormattedMessage id="app.auto.revising.tips" values={{name:textlabel}} defaultMessage="正在对{name}进行自动修订…" />
      })
      that.props.saveClear(false)
      setTimeout(function() {
        initvalue = regularBuilder(initvalue)
        if (allowClearEnter&&allowClear) {
          initvalue = initvalue.replace(/enter-/g, "\n").replace(/space-/g, " ")
        }        
        that.props.onChange(initvalue);
        that.setState({
          tip: <FormattedMessage id="app.auto.revising.finished.tips" defaultMessage="自动修订已完成" />
        })
      }, 500)
      setTimeout(()=> {
        that.props.saveClear(true)
        that.setState({
          visible: false
        })
      }, 1000)

    } else {
        if (allowClearEnter&&allowClear) {
          initvalue = initvalue.replace(/enter-/g, "\n").replace(/space-/g, " ")
        } 
      that.props.onChange(initvalue);
    }
  }

  onChangeCheckbox = (e) => {
    if (e.target.checked) {
      this.setState({
        allowClear: true,
        visible: true
      })
      const that = this
      let { initvalue } = this.props;
      const { allowClearEnter } = this.state;
      if (allowClearEnter) {
        initvalue = initvalue.replace(/^\n+|\n+$|^\s+\n+|\s+\n+$|\n+\s+$|\n+$/g,"")
       
        let firstIndex = initvalue.match(/^\s+/g) && initvalue.match(/^\s+/g)[0].replace(/\s/g, "space-")
        initvalue = initvalue.replace(/\n/g, "enter-").replace(/^\s+/g, firstIndex)
        let initString = initvalue.split(/enter-\s+/g)
        let initMatch = initvalue.match(/enter-\s+/g)||[]
     
        initMatch.map((vo, index) => {
          initMatch[index] = vo.replace(/\s/g, "space-")
        })
        let resultInit = ''
        initString.map((item, index) => {
          resultInit += item
          resultInit += initMatch[index] ? initMatch[index] : ''
        })
        initvalue = resultInit
      }
      setTimeout(()=> {
        if (allowClearEnter) {
          initvalue = initvalue.replace(/enter-/g, "\n").replace(/space-/g, " ")           
          that.props.onChange(initvalue);
        } else {
          that.props.onChange(regularBuilder(initvalue));
        }
        that.setState({
          tip: <FormattedMessage id="app.auto.revising.finished.tips" defaultMessage="自动修订已完成" />
        })
      }, 500)
      setTimeout(()=> {
        that.setState({
          visible: false
        })
      }, 1000)

    } else {
      this.setState({
        allowClear: false
      })
    }
  }

  onChangeCheckboxEnter = (e) => {
    const {props} = this;
    const {allowClear} = this.state;
    const that = this;
    if (e.target.checked) {
      this.setState({
        allowClearEnter: true
      })
      props.saveAllowEnter('Y')
    } else {
      props.saveAllowEnter('N')
      if(allowClear) {
        setTimeout(()=> {      
          that.props.onChange(regularBuilder(props.initvalue));          
          that.setState({
            tip: <FormattedMessage id="app.auto.revising.finished.tips" defaultMessage="自动修订已完成" />
          })
        }, 500)
        setTimeout(()=> {
          that.setState({
            visible: false
          })
        }, 1000)
      }
     
      this.setState({
        allowClearEnter: false
      })
    }
  }


  onChangeCheckboxbraft = (e) => {
    const {isUsebraft} = this.props;
    isUsebraft(e.target.checked)
  }

  handleChange = (editorState) => {
    console.log(editorState.toText())

    const {props} = this;
    props.onChange(editorState.toText());

    this.setState({ editorState })
  }

  render() {
    const { initvalue, textlabel, min, braft ,isUsebraftEdit} = this.props;
    const { visible, allowClear, autoClear, tip, allowEnter } = this.state;
    // let tip = <FormattedMessage id="app.auto.revising.tips" values={{name:textlabel}} defaultMessage="正在对{name}进行自动修订…？"></FormattedMessage>;

    const title = !initvalue ? (
      <span className="numeric-input-title">
        {<FormattedMessage id="app.auto.revising.finished.tips" defaultMessage="自动修订已完成" />}       
      </span>
    ) : tip;
    return (

      <Tooltip
        trigger={['focus']}
        title={title}
        placement="topLeft"
        visible={visible}       
        overlayClassName="autoClearData"
      >
        {autoClear&& !isUsebraftEdit &&
        <Checkbox onChange={this.onChangeCheckbox} className={styles.autoCheck} checked={allowClear}>
          {<FormattedMessage id="app.auto.revising" defaultMessage="自动修订" />}
        </Checkbox>}
        {allowEnter&& !isUsebraftEdit &&
        <Checkbox onChange={this.onChangeCheckboxEnter} className={styles.autoCheckEnter}>
          {<FormattedMessage id="app.auto.enter" defaultMessage="不清洗段前空格和换行" />}
        </Checkbox>}
        {braft&& QUESTION_SHOW_RICHTEXT === "Y" &&
        <Checkbox onChange={this.onChangeCheckboxbraft} className={allowEnter ? styles.autoCheckbraft : styles.autoCheckEnter}>
          {<FormattedMessage id="app.auto.braft" defaultMessage="使用富文本编辑器" />}
        </Checkbox>}

        {   
          isUsebraftEdit ? 
            <BraftEditor 
                value={this.state.editorState} 
                onChange={this.handleChange}
                controls={controls}
                ref={instance => this.editorInstance = instance}
                contentStyle={{height: 210, boxShadow: 'inset 0 1px 3px rgba(0,0,0,.1)',background:"#fff"}}/> :
              <TextArea
                {...this.props}
                maxlength="8000"
                value = {initvalue}
                placeholder={autoClear?formatMessage({id:"app.placeholder.autoClear",defaultMessage:"自动修订后，某些输入字符将被认定为非法字符（如中文、日文等）被清除"}):''}
                onChange={this.onChange}
                onBlur={this.clearDataBlur}
                autosize={min===true?{ minRows:1 , maxRows: 5 }:{ minRows:3 , maxRows: 5 }}
              />
        }

      </Tooltip>

    );
  }
}

export default TextareaClearData;
