import React, { Component } from 'react';
import { Modal,Input,Radio,message,Form} from 'antd';
import router from 'umi/router'
const RadioGroup = Radio.Group;
const { TextArea } = Input;
import './index.less';
import styles from './index.less';
import {publishAnswer} from '@/services/api';
import {timestampToTime} from '@/utils/utils'
import { formatMessage,FormattedMessage,defineMessages} from 'umi/locale';
const messages = defineMessages({
  proofreadTitle: {id:'app.question.proofread.title',defaultMessage:'校对'},
  validateFail: {id:'app.fail.question.proofread',defaultMessage:'不通过'},
  validatePass: {id:'app.pass.question.proofread',defaultMessage:'通过'},
  validateIgnore:{id:'app.question.modify.ignore',defaultMessage:'忽略'},
  validateModified:{id:'app.question.modified',defaultMessage:'已修正'},
  commentInput:{id:'app.is.question.comment.input',defaultMessage:'请输入评语'},
  commentInputLabel:{id:'app.question.comment.input.label',defaultMessage:'评语'},
  validateResult:{id:'app.proofread.result.dialog.title',defaultMessage:'校对结果'},
  passTips:{id:'app.no.comment.in.proofread.pass.tips',defaultMessage:'暂未添加评语'},
  saveBtn:{id:'app.save',defaultMessage:'保存'},
  cancelBtn:{id:'app.cancel',defaultMessage:'取消'},
  closeBtnTit:{id:'app.close.btn',defaultMessage:"关闭"}
});
const FormItem = Form.Item;
@Form.create()
class PublishCorrect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      comment:'',
      verifyStatus:'',
      loading:false
  
    };
  }
  componentDidMount(){    
  }

  onHandleCancel = () => {
    this.setState({
      visible: false,
    });
    this.props.onClose();
  };
  onHandleOK = () => {
   
    const { dataSource } = this.props;
    console.log(dataSource.invalidate[0].verifyStatus)
    console.log(dataSource.status)
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      } else {
        this.setState({
          loading:true
        })
        if(dataSource.status!='SHOW'&&dataSource.invalidate[0].verifyStatus!='300') {
          const params={
            "paperId":dataSource.paperID,
            "questionId": dataSource.questionId,
            "verifyStatus": '100',
            "dealComment": this.state.comment,
            "replierId":localStorage.getItem('specialistId')
          }
            publishAnswer(params).then((res)=> {
              if(res.responseCode==='200') {
                this.setState({
                  visible: false,
                });
                this.props.callback();      
                this.props.onClose();
              } else {
                this.setState({
                  visible: false,
                });
                this.props.onClose();
                message.warning(res.data|| formatMessage({id:"app.text.hfjdsb",defaultMessage:"回复校对失败"}) + '！');
                this.setState({
                  loading:false
                })
                if(res.responseCode==='464') {
                  router.push('/task')
                }
              }     
            }).catch(err => {
              console.log(err);
            });
          } else {
            this.setState({
              visible: false,
            });    
            this.props.onClose();
          }
      }
      if(!(dataSource.status!='SHOW'&&dataSource.invalidate[0].verifyStatus!='300')) {
          this.setState({
            visible: false,
          });    
          this.props.onClose();
        }
    })
       
  };
  saveValues=(e)=>{
    this.setState({
      comment: e.target.value,
    });
  }
  checkInputDesc = (rule, value, callback) => {
    if (value.length <201) {
      callback();
      return;
    }
    callback(formatMessage({id:"app.text.nsrdpytcl",defaultMessage:"您输入的评语太长了哦"}) + '！');
  }
  render() {  
    const { dataSource } = this.props;
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const {loading} = this.state;
    return (
      <Modal
        visible={this.state.visible}
        centered={true}
        title={formatMessage(messages.validateResult)}
        closable={true}
        maskClosable={false}
        cancelText={formatMessage(messages.cancelBtn)}
        okText={dataSource.status=='SHOW'||dataSource.invalidate[0].verifyStatus=='300'?formatMessage(messages.closeBtnTit):formatMessage(messages.validateIgnore)}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className={dataSource.invalidate[0].verifyStatus=='300'?'publishTagModal':'publishTagEdit'}
        destroyOnClose={true}
        cancelButtonProps={{disabled:loading}}
        okButtonProps={{disabled:loading,loading}}
      >
       <Form layout="vertical">
        <div className={styles.validateResult}>
        <div className="validateList">
        {
          dataSource.invalidate.map((item)=>{
            return <div key={item.questionId}><div className="list">
            <span className="commentTime"> {item.verifierName} {timestampToTime(item.verifierTime)}</span>        
            <div className="detail">
            {item.verifyStatus==0&&<span className="Nothrough">{formatMessage(messages.validateFail)}</span>}
            {item.verifyStatus==100&&<span className="ignore">{formatMessage(messages.validateIgnore)}</span>}
            {(item.verifyStatus==200||item.verifyStatus==250)&&<span className="ignore">{formatMessage(messages.validateModified)}</span>}
            {item.verifyStatus==300&& <span className="throughOk">{formatMessage(messages.validatePass)}</span>}
            </div>
            <h2 className="comment">{item.comment?item.comment:formatMessage(messages.passTips)}</h2>
          </div></div>
          })
        }      
        </div>
        {dataSource.invalidate.map((item,index)=>{
        return <div key={index}>     
        {item.verifyStatus==0&&<h1>{formatMessage(messages.commentInputLabel)}</h1>}
        {item.verifyStatus==0&&
             <FormItem className="collection-create-form_last-form-item">
             {getFieldDecorator('comment', {
               initialValue:'',
               rules: [{ required: true, message:formatMessage(messages.commentInput)}, { validator: this.checkInputDesc}],
             })(<TextArea rows={3} onChange={this.saveValues} placeholder={formatMessage(messages.commentInput)} />)}
           </FormItem>
        }
        </div>
        })
      }
        </div>
        </Form>
      </Modal>
    );
  }
}

export default PublishCorrect;
