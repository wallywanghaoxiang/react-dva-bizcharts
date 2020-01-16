// 新建试卷包

import React, { Component } from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import { Modal,Form} from 'antd';
import { connect } from "dva";
import styles from './index.less'


const messages = defineMessages({
  paperAdd:{id:'app.menu.papermanage.paperAdd',defaultMessage:'添加试卷包'},
  paperAddInput:{id:'app.menu.papermanage.paperAddInput',defaultMessage:'请输入试卷包序列号'},
  papererrorInput:{id:'app.menu.papermanage.papererrorInput',defaultMessage:'请输入完整的25位试卷包序列号'},
  cancelText:{id:'app.cancel',defaultMessage:'取消'},
  confirm:{id:'app.confirm',defaultMessage:'确认'},
 
})


@Form.create()


@connect(({ papermanage, loading }) => ({
  submitting : loading.effects['papermanage/addPaperPackage'],
  papermanage
}))

class NewPaper extends Component {
    state = {
      code:["","","","",""],
    };

      componentWillMount() {
        
    }

    // 提交表单
    submitModal=()=>{
      const {code} = this.state;
      const codeString = code.join();
      const {dispatch} = this.props;
      const campusId = localStorage.getItem('campusId');  
      const that = this;        
      dispatch({
        type: 'papermanage/addPaperPackage',
        payload:{
          serialNumber:codeString.split(',').join('-'),  
          campusId          
        },
        callback:(res)=>{
          if(res==='200') {
            that.hideModal(res)
         that.setState({code:["","","","",""]})
          }
          else {
            that.hideModal('')
            that.setState({code:["","","","",""]})
          }
        }
      }).then(()=>{
         
      }); 
    }

  

    onHandleTablePaste = (e,id) => {
        // console.log(e.clipboardData.getData('Text'));
    
        if (document.all)
          // 判断IE浏览器
          window.event.returnValue = false;
        else e.preventDefault();
    
        // 获取粘贴板数据
        let data = null;
        const clipboardData = window.clipboardData || e.clipboardData; // IE || chrome
        // console.log(clipboardData);
        data = clipboardData.getData('Text');
        // console.log(data.replace(/\t/g, '\\t').replace(/\n/g, '\\n')); //data转码
    
        // 解析数据
        const ecxelData = data
          .split('\n')
          .filter((item)=> {
            // 兼容Excel行末\n，防止出现多余空行
            return item !== '';
          })
          .map((item)=> {
            return item.split('-');
          });
    
        // 数据清洗
        let arrStr = JSON.stringify(ecxelData);
        arrStr = arrStr.replace(/[\\r\\n]/g, ''); // 去掉回车换行
        arrStr = arrStr.replace(/\s*/g, '');
        arrStr = arrStr.replace(/^[\s]+|[\s]+$/g, ''); // 去掉全角半角
    
        const arr = JSON.parse(arrStr);
        const {code} = this.state
        if (arr[0].length > 0) {
        
         code.forEach((item, index) => {
           if(index<arr[0].length) {
            const current = id!==''?index+id:index;
            code[current]= arr[0][index].length>5?arr[0][index].substring(0,5):arr[0][index]||''
           }         
        });
        this.setState({
          code
        })         
        }
      }

      switchCode=(e,id)=>{
        const {code} = this.state;
        code[id] = e.target.value;
        if(e.target.value.length===5) {
          if(id==='0') {
            this.input2.focus();
          } else if(id==='1') {
            this.input3.focus();
          } else if(id==='2') {
            this.input4.focus();
          } else if(id==='3') {
            this.input5.focus();
          } 
        }     
        this.setState({
          code
        })
      }

      // 隐藏弹窗
      hideModal=(res)=>{
        const {hideDialg} = this.props;
        hideDialg(res)
        this.setState({code:["","","","",""]})
      }

    render() {
        const {showModal,submitting} = this.props;
        const {code}= this.state;
        const codeValue1 = code[0]
        const codeValue2 = code[1]
        const codeValue3 = code[2]
        const codeValue4 = code[3]
        const codeValue5 = code[4]
        console.log(codeValue1===''&&codeValue2===''&&codeValue3===''&&codeValue4===''&&codeValue5==='')
        const disableBtn =codeValue1.length<5||codeValue2.length<5||codeValue3.length<5||codeValue4.length<5||codeValue5.length<5;
        const errorInfo = disableBtn&&!(codeValue1===''&&codeValue2===''&&codeValue3===''&&codeValue4===''&&codeValue5==='')?formatMessage(messages.papererrorInput):'';
        return (
          <Modal
            title={formatMessage(messages.paperAdd)}
            okText={formatMessage(messages.confirm)}
            cancelText={formatMessage(messages.cancelText)}
            confirmLoading={submitting}
            visible={showModal}
            okButtonProps={{ disabled:disableBtn }}
            width={540}
            closable={false}
            centered
            onCancel={()=>this.hideModal('')}
            destroyOnClose
            onOk={this.submitModal}
            className={styles.addPaper}
          >
            <div className={styles.addPaperPackage}>
              <div className={styles.paperTips}>{formatMessage(messages.paperAddInput)}</div>
              
              <div className={styles.inputCode}>
                <input maxLength={5} onChange={(e)=>this.switchCode(e,'0')} value={codeValue1} ref={input1 => {this.input1 = input1}} onPaste={(e,id)=>this.onHandleTablePaste(e,0)} />-
                <input maxLength={5} onChange={(e)=>this.switchCode(e,'1')} value={codeValue2} ref={input2 => {this.input2 = input2}} onPaste={(e,id)=>this.onHandleTablePaste(e,1)} />-
                <input maxLength={5} onChange={(e)=>this.switchCode(e,'2')} value={codeValue3} ref={input3 => {this.input3 = input3}} onPaste={(e,id)=>this.onHandleTablePaste(e,2)} />-
                <input maxLength={5} onChange={(e)=>this.switchCode(e,'3')} value={codeValue4} ref={input4 => {this.input4 = input4}} onPaste={(e,id)=>this.onHandleTablePaste(e,3)} />-
                <input maxLength={5} onChange={(e)=>this.switchCode(e,'4')} value={codeValue5} ref={input5 => {this.input5 = input5}} onPaste={(e,id)=>this.onHandleTablePaste(e,4)} />
              </div>
               
              <div className={styles.errorInfomation}>{errorInfo}</div>
            
            </div>
          </Modal>
         
        )
    }
}

export default NewPaper