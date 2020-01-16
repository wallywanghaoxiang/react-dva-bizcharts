import React, { Component } from 'react';
import './index.less';
import CustomUpload from '@/frontlib/components/CustomUpload';
import IconButton from '@/frontlib/components/IconButton';
import { formatMessage,FormattedMessage } from 'umi/locale';
/**
 * 图片上传组件
 * url          图片路径
 * duration     图片ID
 */
class UpLoadImg extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: '', //图片id
      audioData: null,
      name: '', //图片名称
      audioUrl: "", //图片路径
    };
  }
  componentDidMount() {
    const { url, duration, name, id } = this.props;
    if (url) {
      this.setState({
        audioUrl: url,
        duration: duration,
        name: name,
        id: id
      })
    }
  }
  delSound() {
    this.setState({
      id: "",
      audioUrl: "",
      duration: 0
    })

    this.audioValue = null;
    this.props.uploadImgID('')

  }
  /**
   * 上传
   */
  handleSuccess = (id, path, name) => {
    this.setState({
      upLoadSuccess: true,
      id: id,
      name: name,
      audioUrl: path,
    })
    this.props.uploadImgID(id)
  }
  render() {
    const { upLoadSuccess, name, audioUrl } = this.state;
    return (
      <div>
        {
          audioUrl ?  <div className="uploadImage">
                      <img src={audioUrl}/>
                      <IconButton iconName="icon-detele" type="" className="uploadImgDelete" onClick={this.delSound.bind(this)}/>
                    </div>
                    :
                    <div className="uploadImage">
                    <div className="uploadOper">
                     <IconButton iconName="icon-camera" type="" className="textNone" />
                    <div className="ant-upload-text">{<FormattedMessage id="app.img.upload.btn" defaultMessage="选择图片"></FormattedMessage>}</div>
                    <div className="imgsize">{formatMessage({id:"app.text.tpccjy",defaultMessage:"图片尺寸建议"})} 310*220PX</div>
                    </div>
                   <CustomUpload onSuccess={this.handleSuccess} accept='image/*'/></div>
        }



      </div>
    );
  }
}

export default UpLoadImg;
