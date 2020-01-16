import React, { PureComponent } from 'react';
import IconButton from '@/frontlib/components/IconButton';
import AudioTextModal from '../AutoPlay/AudioTextModal/api';
import styles from '../AutoPlay/index.less';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';
import {
  isNowRecording
} from '@/frontlib/utils/utils';

/**
  视频原文组件
  * @Author    tina.zhang
  * @DateTime  2018-10-17
 */
export default class AutoPlay extends PureComponent {
  constructor(props) {
    super(props);
  }

 
  render() {

    const { className, text, style} = this.props

    return <div className={styles.addquestion_audio+" myAudio "+className} style={style}>
                    <IconButton 
                    iconName="icon-text" 
                    className={styles.myIcon}
                    onClick={(e)=>{
                        e.stopPropagation();
                        if(isNowRecording()) {return};
                        AudioTextModal({
                              dataSource: text,
                              title:formatMessage({id:"app.text.spyw",defaultMessage:"视频原文"}),
                              callback: (paperHeadName,navTime,state) => {}
                            });
                        }
                    }
                />
          </div>

      
    

  }
}
