import React, { Component } from 'react';
import { Modal, message, Form, Input } from 'antd';
import styles from './index.less';
import UploadFile from '../UpLoadFile/index';
import { formatMessage, FormattedMessage } from 'umi/locale';
import emitter from '@/utils/ev';

const { TextArea } = Input;

const FormItem = Form.Item;
@Form.create()

/**
 * 保存开卷介绍入参 {
paperId (string, optional): 试卷ID ,
paperHeadName (string, optional): 开卷介绍文本 ,
paperHeadAudio (string, optional): 开卷介绍音频ID ,
paperIntroductionTime (integer, optional): 开卷介绍音频持续时间 ,
navTime (integer, optional): 跳转倒计时
}
 */
class AddNewPaperModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      upLoadSuccess: false,
      id: '',
      duration: 0,
      audioData: null,
      name: '',
      audioUrl: "",
      isPlay: false,
      iscomplete:false
    };
  }

  componentDidMount() {
    const { dataSource } = this.props;
    if (dataSource.paperHeadName) {
      this.paperHeadName = dataSource.paperHeadName;
      this.navTime = dataSource.paperHeadNavTime;
      this.paperHeadDelay = dataSource.paperHeadDelay;
      this.setState({
        id: dataSource.paperHeadAudio,
        audioUrl: dataSource.paperHeadAudioUrl,
        duration: dataSource.paperHeadAudioTime,
        name: dataSource.name
      })
    }
  }

  onHandleCancel = () => {
    this.setState({
      visible: false,
    });
    this.props.onClose();
  };
  onHandleOK = () => {
    let self = this;
    const { form } = self.props;

    if((this.state.audioUrl == "" || this.state.audioUrl == undefined) && self.paperHeadDelay == "0"){
      message.warning(formatMessage({id:"app.text.paperHeadDelay",defaultMessage:"停留时间请输入大于0,小于100的数字"}))
      return;
    }
    form.validateFields((err, values) => {
      if (err) {
        message.warning(formatMessage({id:"app.text.validateFields",defaultMessage:"请填写完整数据！"}));
        return
      } else {
        if (Number(self.navTime) >= 0) {
          self.props.callback(self.paperHeadName, self.navTime, self.state, self.paperHeadDelay);
          this.setState({iscomplete:true})
          emitter.removeAllListeners("hideModal");
          emitter.addListener('hideModal', x => {
            self.setState({
              visible: false,
            });
            self.props.onClose();
          })

        } else {
          // message.warning('等待时间请输入大于0的数字!');
        }

      }
    })



  };

  isRequired = (rules, value, callback) => {
    if (Number(value) >= 0 && Number(value) < 100) {
      callback()
    } else {
      callback(formatMessage({id:"app.text.paperHeadDelay",defaultMessage:"停留时间请输入大于0,小于100的数字"}))
    }

  }



  render() {
    const { dataSource, form } = this.props;
    const { upLoadSuccess, name, audioUrl, isPlay, id,iscomplete } = this.state;
    const { getFieldDecorator } = form;
    return (
      <Modal
        visible={this.state.visible}
        centered={true}
        title={<FormattedMessage id="app.open.book.add.btn" defaultMessage="添加开卷"></FormattedMessage>}
        closable={false}
        cancelText="取消"
        okText="保存"
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className={styles.PaperModal}
        destroyOnClose={true}
        maskClosable={false}
        okButtonProps={{disabled:iscomplete}}
      >
      <Form layout="vertical">
        <div>
          <div className={styles.title}>
          <FormattedMessage id="app.open.book.intro.label" defaultMessage="开卷介绍"></FormattedMessage>
            <span className={styles.require}>*</span>
          </div>
          <FormItem label={''}>
              {getFieldDecorator('paperHeadName', {
              initialValue: dataSource.paperHeadName,
              rules: [
                  { required: true, message: formatMessage({id:"app.text.paperHeadName",defaultMessage:"请输入开卷介绍"}) }
              ],
              })(
              <TextArea
                  className={styles.textarea_style}
                  onChange={(e) => (
                    this.paperHeadName = e.target.value
                  )}
                  maxLength={10000}/>
              )}
          </FormItem>
        </div>
        <FormItem label={''}>
              {getFieldDecorator('paperHeadAudio', {
              initialValue: dataSource.paperHeadAudio,
              })(
              <UploadFile
                id={dataSource.paperHeadAudio}
                url={dataSource.paperHeadAudioUrl}
                duration={dataSource.paperHeadAudioTime}
                name={dataSource.name}
                style={{marginTop:'20px'}}
                callback={(e)=>{
                  this.props.form.setFieldsValue({
                    paperHeadAudio: e.id,
                  });
                  this.setState(e)
                }}
              />
        )}
        </FormItem>
        <div className="waitBox">
          <div className={styles.title}>
            {formatMessage({id:"app.text.waitBox",defaultMessage:"停留时间（秒）"})}
            <span className={styles.require}>*</span>
          </div>
          <FormItem label={''}>
              {getFieldDecorator('paperHeadDelay', {
              initialValue: dataSource.paperHeadDelay,
              rules: [
                  { required: true, message: formatMessage({id:"app.placeholder.paperHeadDelay",defaultMessage:"请输入停留时间"}) },
                  { validator: this.isRequired }
              ],
              })(
                <Input  className={styles.input_style}
                        type={"number"}
                        onChange={(e) => {
                          this.paperHeadDelay = e.target.value
                        }}
                    />
                )}
          </FormItem>
        </div>
        <div className="waitBox">
          <div className={styles.title}>
            {formatMessage({id:"app.text.navTime",defaultMessage:"开始考试倒计时（秒）"})}
            <span className={styles.require}>*</span>
          </div>
          <FormItem label={''}>
              {getFieldDecorator('navTime', {
              initialValue: dataSource.paperHeadNavTime,
              rules: [
                  { required: true, message: formatMessage({id:"app.placeholder.paperHeadNavTime",defaultMessage:"请输入等待时间"}) },
                  { validator: this.isRequired }
              ],
              })(
                <Input  className={styles.input_style}
                        type={"number"}
                        onChange={(e) => {
                          this.navTime = e.target.value
                        }}
                    />
                )}
          </FormItem>
        </div>
      </Form>
      </Modal>
    );
  }
}

export default AddNewPaperModal;
