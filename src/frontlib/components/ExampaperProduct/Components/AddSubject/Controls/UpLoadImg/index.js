import React, { Component } from 'react';
import './index.less';
import CustomUpload from '@/frontlib/components/CustomUpload';
import IconButton from '@/frontlib/components/IconButton';
import { fetchPaperFileUrl } from '@/services/api';
import { FormattedMessage } from 'umi/locale';

/**
 * 图片上传组件
 * url          图片路径
 * duration     图片ID
 */
class UpLoadImg extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: props.id?props.id:'', //图片id
      audioData: null,
      name: '', //图片名称
      audioUrl: "", //图片路径
    };
  }

  componentDidMount() {
    const { id } = this.props;
    if (id) {
      let self = this;
      fetchPaperFileUrl({
        fileId: id
      }).then((e) => {
        self.setState({
          id: e.data.id,
          audioUrl: e.data.path,
          name: e.data.fileName
        })
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    const { id } = nextProps;
    if (this.props.id&&(id != this.props.id)) {
      let self = this;
      fetchPaperFileUrl({
        fileId: id
      }).then((e) => {
        self.setState({
          id: e.data.id,
          audioUrl: e.data.path,
          name: e.data.fileName
        })
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
    const { id, name, audioUrl } = this.state;
    const { displaySize,isChoice } = this.props;

    let str = "宽度440px";

    let tip = "图片尺寸建议"
    if(isChoice){
      str = "宽度130px  高度90px";
      tip = "建议";
    }

    if (displaySize) {
      if (displaySize.width) {
        str = "宽度" + displaySize.width + "px "
      }else{
        if(isChoice){
          str = "宽度130px";
        }else{
          str = "宽度440px";
        }

      }
      if (displaySize.height) {
        str = str + "高度" + displaySize.height + "px "
      }else{
        if(isChoice){
          str = str + "高度90px "
        }
      }
    }

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
                    <div className="imgsize">{tip} {str}</div>
                    </div>
                   <CustomUpload onSuccess={this.handleSuccess} accept='image/*' type="controls"/></div>
        }



      </div>
    );
  }
}

export default UpLoadImg;
