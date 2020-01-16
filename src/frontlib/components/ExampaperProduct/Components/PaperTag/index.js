import React, { Component } from 'react';
import { Modal,Input,Select } from 'antd';
const Option = Select.Option;
import './index.less';
import styles from './index.less';
import {queryDifficult,updateDifficult} from '@/services/api';
import { formatMessage,FormattedMessage,defineMessages} from 'umi/locale';
const messages = defineMessages({
  PaperTagedit: {
    id: 'app.check.question.tag.dialog.title',
    defaultMessage: '试卷标签',
  },
  facilityValue: {
    id: 'app.question.facility.value',
    defaultMessage: '难易度',
  },
  SaveBtn: {
    id: 'app.save',
    defaultMessage: '保存',
  },
  addFail: {
    id: 'app.testing.addFail',
    defaultMessage: '添加标签失败！',
  },
  selectedTag: {
    id: 'app.testing.selectedTag',
    defaultMessage: '请选择标签',
  },
  closeBtnTit:{id:'app.close.btn',defaultMessage:"关闭"}

});
/**
 * 试卷标签

 */
class PaperTag extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      evaluationEngineType:[],
      defaultEvaluationEngine:props.dataSource.difficultLevel||''
    };
  }

  componentDidMount(){
   //获取难易度
   queryDifficult().then((res)=> {
    if (res.responseCode == '200') {
      this.setState({
        evaluationEngineType:res.data
      }) 
      }
    }).catch(err => {
  }); 
  }

  onHandleCancel = () => {
    this.setState({
      visible: false,
    });
    this.props.onClose();
  };
  onHandleOK = () => {
    const { dataSource } = this.props;
    if(dataSource.status!='SHOW') {
      const params={
        "paperId":dataSource.paperID,
        "difficultLevel": this.state.defaultEvaluationEngine,
      }
      updateDifficult(params).then((res)=> {
        if(res.responseCode==200) {
          this.setState({
            visible: false,
          });
          this.props.callback();      
          this.props.onClose();
        } else {
          message.warning(formatMessage({id:"app.text.tjbqsb",defaultMessage:"添加标签失败！"}))
        }     
      }).catch(err => {
        console.log(err);
      });
    }

    this.setState({
      visible: false,
    });

    
    this.props.onClose();
    
  };
  handleChange=(value)=>{
      this.setState({
        defaultEvaluationEngine:value
      })
    }
  render() {  
    const { evaluationEngineType} = this.state;
    const { dataSource } = this.props;
    return (
      <Modal
        visible={this.state.visible}
        centered={true}
        title={formatMessage({id:"app.text.sjbq",defaultMessage:"试卷标签"})}
        maskClosable={false}
        closable={false}
        cancelText={formatMessage({id:"app.text.cancel",defaultMessage:"取消"})}
        okText={dataSource.status=='SHOW'?formatMessage(messages.closeBtnTit):formatMessage(messages.SaveBtn)}

        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className={dataSource.status=='SHOW'?'PaperTagModal':'PaperTagEdit'}
        destroyOnClose={true}
      >
        <div className={styles.validateResult}>       
        <h1>{formatMessage(messages.facilityValue)}</h1>
       {dataSource.status=='SHOW'&&<Input  className={styles.changeStatusNo} value={dataSource.difficultLevelValue} disabled={true} readOnly/>}
       {dataSource.status!='SHOW'&&evaluationEngineType.length>0&&<Select 
          className={styles.changeStatus}
          onChange={this.handleChange}
          value={this.state.defaultEvaluationEngine?this.state.defaultEvaluationEngine:formatMessage({id:"app.testing.selectedTag",defaultMessage:"请选择标签"})}
        >
          {evaluationEngineType.map((item)=>{
            return <Option value={item.code} key={item.code}>{item.value}</Option>
          })}         
        </Select>}
        </div>
      </Modal>
    );
  }
}

export default PaperTag;
