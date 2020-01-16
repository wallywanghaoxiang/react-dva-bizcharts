import React, { Component } from 'react';
import Dimensions from 'react-dimensions';
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';
import jiantou from '@/assets/campus/jiantou.png';
import tip from '@/assets/campus/teacher_config_tip.png';
import iKnow from '@/assets/campus/i_kwon.png';
import hande from '@/assets/campus/hande.png';
import person from '@/assets/campus/person.png';
import classPic from '@/assets/campus/class.png';

const messages = defineMessages({
  classN:{id:'app.campus.manage.basic.class',defaultMessage:'班'},
 
})
class NoviceNavigation extends Component {
    state = {
    };

    componentWillMount() {
    }

    closeNoviceNavigation = () => {
      const { onCloseNoviceNavigation } = this.props;
      onCloseNoviceNavigation();
    }

    render() {
       const { containerWidth,containerHeight,swap } = this.props;
        return (
          <div className={styles.noviceNavigation} style={{width:containerWidth,height:containerHeight}}>
            <div className={styles.content}>
              <div className={styles.class} style={{top:swap?'194px':'134px'}}>
                {/* <img src={classPic} alt="class" /> */}
                1{formatMessage(messages.classN)}
              </div>
              <div className={styles.middle}>
                <div>
                  <img src={jiantou} alt="jiantou" />
                </div>
                <div className={styles.pt}>
                  <img src={tip} alt="tip" />
                </div>
                <div className={styles.pt}>
                  <img src={iKnow} alt="iKnow" style={{cursor:'pointer'}} onClick={this.closeNoviceNavigation} />
                </div>
              </div>
              <div className={styles.person} style={{top:swap?'235px':'175px'}}>
                <img src={person} alt="person" />
                <img className={styles.hande} src={hande} alt="hande" /> 
              </div>
            </div>
          </div>
    )
    }
}


export default Dimensions({
  getHeight: () => {
    return window.innerHeight;
  },
  getWidth: () => {
    return window.innerWidth;
  },
})(NoviceNavigation);