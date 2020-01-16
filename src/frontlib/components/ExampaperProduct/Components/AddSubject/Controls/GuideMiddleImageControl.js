/**
 * @Author    tina
 * @DateTime  2018-11-20
 * @copyright 7.2.12  中间指导图片控件（guideMiddleImageControl）
 */
import React, { Component } from 'react';
import { Form } from 'antd';
import UpLoadImg from './UpLoadImg';
import { formatMessage, FormattedMessage } from 'umi/locale';
const FormItem = Form.Item;
import './index.less';

//获取上传文件的详情
import { fetchPaperFileUrl } from '@/services/api';
class GuideMiddleImageControl extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      id: '',
      name: '',
      audioUrl: "",

    };
  }
  componentDidMount() {
    const { data, showData, subIndex, index2 } = this.props;
    //渲染数据
    const editData = showData && showData.data
    var fileID = '';
    let self = this;
    if (editData) {
      const mainIndex = index2 == 'all' ? '1' : index2
      if (editData && editData.patternType != "COMPLEX") {
        fileID = editData.mainQuestion.guideMiddleImage;

      } else if (editData && editData.patternType == "COMPLEX" && editData.groups[mainIndex].data) {
        fileID = editData.groups[mainIndex].data.mainQuestion.guideMiddleImage;
      }
      if (fileID) {
        fetchPaperFileUrl({
          fileId: fileID
        }).then((e) => {
          self.setState({
            id: e.data.id,
            audioUrl: e.data.path,
            name: e.data.fileName
          })
        })
      }
      if (fileID) { this.props.saveStemImgModal(fileID, index2) }

    }
  }

  // 保存题前指导图片
  saveStemImg = (id) => {
    const { index2, subIndex } = this.props;
    const mainIndex = index2 == 'all' ? '1' : index2
    this.props.saveStemImgModal(id, index2)
    this.props.form.setFieldsValue({
      stemTextImgall: id,
      stemTextImg: id,
    });
  }
  render() {
    const { data, showData, index2, subIndex } = this.props;
    const mainIndex = index2 == 'all' ? '1' : index2
    const { id, audioUrl, name, stemTextValue } = this.state;
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const tipMessage = <FormattedMessage id="app.is.upload.model" values={{name:data.params.label}} defaultMessage="请上传{name}"></FormattedMessage>;
    return (
      <div className="demon">     
         <FormItem label={data.params.label}>
                {getFieldDecorator('guideMiddleImage'+subIndex+index2, {
                  initialValue: id,
                  rules: [{ required: false, message: tipMessage }],
                })(
                 <div> {audioUrl!=''&&<UpLoadImg
                 displaySize={data.params.displaySize}
                  id={id}
                  url={audioUrl}
                  duration={''}
                  name={name}
                  uploadImgID={(id)=>this.saveStemImg(id,mainIndex)}
                /> }    
                {audioUrl==''&&<UpLoadImg
                displaySize={data.params.displaySize}
                  id={id}
                  url={audioUrl}
                  duration={''}
                  name={name}
                  uploadImgID={(id)=>this.saveStemImg(id,mainIndex)}
                /> }  </div>
                )}
              </FormItem>
      </div>
    );
  }
}

export default GuideMiddleImageControl;
