import React, { Component } from 'react';
import { Modal, Input, Radio, message, Form } from 'antd';
import router from 'umi/router'

const RadioGroup = Radio.Group;
const { TextArea } = Input;
import './index.less';
import styles from './index.less';
import { publishVerifies } from '@/services/api';
import { timestampToTime } from '@/utils/utils';
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
  saveBtn:{id:'app.save',defaultMessage:'保存'},
  cancelBtn:{id:'app.cancel',defaultMessage:'取消'},
  closeBtnTit:{id:'app.close.btn',defaultMessage:"关闭"}
});
const FormItem = Form.Item;
@Form.create()
class ValidateQuestion extends Component {
  constructor(props) {
    super(props);
    const { dataSource } = props;
    this.state = {
      visible: true,
      loading:false,
      cancelLoading:false,
      // comment:
      //   dataSource.invalidate.length > 0
      //     ? (dataSource.invalidate[0] && dataSource.invalidate[0].comment) || ''
      //     : '',
      comment:'',
      verifyStatus:
        dataSource.invalidate.length > 0
          ? dataSource.invalidate[0] && (dataSource.invalidate[0].verifyStatus == 300||dataSource.invalidate[0].verifyStatus == 250)
            ? 300
            : 0
          : '',
    };
  }
  componentDidMount() {}

  onHandleCancel = () => {    
    const { dataSource } = this.props;
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      } else {
        if (dataSource.status != 'SHOW') {
          this.setState({
            cancelLoading:true
          })
          const params = {
            paperId: dataSource.paperID,
            questionId: dataSource.questionId,
            verificationType: dataSource.masterData.staticIndex.mainIndex
              ? 'QUESTION'
              : 'INTRODUCTION',
            verifyStatus: 0,
            comment: this.state.comment,
            dealComment: '',
            hasValid: 'Y',
            mainOrderIndex: dataSource.masterData.staticIndex.mainIndex - 1,
            rawOrderIndex: dataSource.masterData.staticIndex.questionIndex,
            verifierId: localStorage.getItem('specialistId'),
          };
          publishVerifies(params)
            .then(res => {              
              if (res.responseCode === '200') {
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
                message.warning(res.data||formatMessage({id:"app.text.fbjdsb",defaultMessage:"发布校对失败"}) + '！');
                if(res.responseCode==='464') {
                  router.push('/task')
                }
              }
              this.setState({
                cancelLoading:false
              })
            })
            .catch(err => {
              console.log(err);
            });
        } else {
          this.setState({
            visible: false,
          });
          this.props.onClose();
        }
      }
    });
  };
  onHandleOK = () => {
    const { dataSource } = this.props;
        if (dataSource.status != 'SHOW') {
          this.setState({
            loading:true
          })
          const params = {
            paperId: dataSource.paperID,
            questionId: dataSource.questionId,
            verificationType: dataSource.masterData.staticIndex.mainIndex
              ? 'QUESTION'
              : 'INTRODUCTION',
            verifyStatus: 300,
            comment: this.state.comment,
            dealComment: '',
            hasValid: 'Y',
            mainOrderIndex: dataSource.masterData.staticIndex.mainIndex - 1,
            rawOrderIndex: dataSource.masterData.staticIndex.questionIndex,
            verifierId: localStorage.getItem('specialistId'),
          };
          publishVerifies(params)
            .then(res => {
            
              if (res.responseCode === '200') {
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
                message.warning(res.data||formatMessage({id:"app.text.fbjdsb",defaultMessage:"发布校对失败"}) + '！');
                if(res.responseCode==='464') {
                  router.push('/task')
                }
              }
              this.setState({
                loading:false
              })
            })
            .catch(err => {
              console.log(err);
            });
        } else {
          this.setState({
            visible: false,
          });
          this.props.onClose();
        }
  
  };
  selectResult = e => {
    const { form } = this.props;
    form.resetFields()    
    this.setState({
      verifyStatus: e.target.value,
      comment: '',
    });
  };
  saveValues = e => {
    this.setState({
      comment: e.target.value,
    });
  };
  checkInputDesc = (rule, value, callback) => {
    if (value.length <201) {
      callback();
      return;
    }
    callback(formatMessage({id:"app.text.nsrdpytcl",defaultMessage:"您输入的评语太长了哦"}) + '！');
  }

  hideModal=()=>{
    this.props.onClose();
    this.setState({
      visible: false,
    });
  }

  render() {
    const { dataSource } = this.props;
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const {verifyStatus,loading,cancelLoading} = this.state;
    return (
      <Modal
        visible={this.state.visible}
        centered={true}
        title={formatMessage(messages.proofreadTitle)}
        closable={false}
        okButtonProps={{ disabled: loading||cancelLoading,loading:loading }}
        cancelButtonProps={{ disabled: cancelLoading||loading }}
        maskClosable={false}
        cancelText={formatMessage(messages.validateFail)}
        okText={dataSource.status == 'SHOW' ? formatMessage(messages.closeBtnTit) :formatMessage(messages.validatePass)}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className={dataSource.status == 'SHOW' ? 'validateTagModal' : styles.PaperModal}
        destroyOnClose={true}
      >
      <button class="ant-modal-close" onClick={this.hideModal}><span className="ant-modal-close-x"><i className="iconfont icon-close"></i></span></button>
        <Form layout="vertical">
          <div className={styles.validateResult}>
            <div className="validateList">
              {dataSource.invalidate.map(item => {
                return (
                  <div key={item.questionId}>
                    <div className="list">
                      <span className="commentTime">
                        {' '}
                        {item.verifierName} {timestampToTime(item.verifierTime)}
                      </span>
                      <div className="detail">
                        {(item.verifyStatus == 100||item.verifyStatus == 200||item.verifyStatus == 0) && <span className="Nothrough">{formatMessage(messages.validateFail)}</span>}
                        {(item.verifyStatus == 300||item.verifyStatus == 250) && <span className="throughOk">{formatMessage(messages.validatePass)}</span>}
                      </div>
                      <h2 className="comment">{item.comment}</h2>
                    </div>
                    {(item.verifyStatus == '100' || item.verifyStatus == '200'|| item.verifyStatus == '250') && (
                      <div className="list">
                        <span className="commentTime">
                          {' '}
                          {item.replierName}{' '}
                          {item.replierTime != null ? timestampToTime(item.replierTime) : ''}
                        </span>
                        <div className="detail">
                          {item.verifyStatus == 0 && <span className="Nothrough">{formatMessage(messages.validateFail)}</span>}
                          {item.verifyStatus == 100 && <span className="ignore">{formatMessage(messages.validateIgnore)}</span>}
                          {(item.verifyStatus == 200||item.verifyStatus == 250) && <span className="ignore">{formatMessage(messages.validateModified)}</span>}
                          {item.verifyStatus == 300 && <span className="throughOk">{formatMessage(messages.validatePass)}</span>}
                        </div>
                        <h2 className="comment">{item.dealComment}</h2>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {dataSource.status != 'SHOW' && (
              <div>
                {/* <h1>{formatMessage(messages.validateResult)}</h1>
                <div className="validateSelect">
                  <FormItem className="collection-create-form_last-form-item">
                    {getFieldDecorator('modifier', {
                      initialValue: this.state.verifyStatus,
                      rules: [{ required: true, message: '请选择校对结果!' }],
                    })(
                      <Radio.Group onChange={this.selectResult}>
                        <Radio value={300}>{formatMessage(messages.validatePass)}</Radio>
                        <Radio value={0}>{formatMessage(messages.validateFail)}</Radio>
                      </Radio.Group>
                    )}
                  </FormItem>
                </div> */}
                <h1>{formatMessage(messages.commentInputLabel)}</h1>
                <FormItem className="collection-create-form_last-form-item">
                  {getFieldDecorator('comment', {
                    initialValue: '',
                    rules: [{ required: true, message: formatMessage(messages.commentInput)}, { validator: this.checkInputDesc}],
                  })(<TextArea rows={3} onChange={this.saveValues} placeholder={formatMessage(messages.commentInput)} />)}
                </FormItem>
              </div>
            )}
          </div>
        </Form>
      </Modal>
    );
  }
}

export default ValidateQuestion;
