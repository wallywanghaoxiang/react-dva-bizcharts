
import React, { Component } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { formatMessage, defineMessages } from 'umi/locale';
import { connect } from "dva";
import styles from './index.less';

const messages = defineMessages({
  mypaper:{id:'app.menu.papermanage.mypaper',defaultMessage:'我的试卷'},
 
})


@connect(({ papermanage }) =>{
  const {paperInfoList} = papermanage;
  return { paperInfoList};
})
class mypaper extends Component {
    state = {
      };

      componentWillMount() {
    }


    render() {
       
        return (
          <div className={styles['teacher-manager']}> 
            <h1 className={styles.stylesName}>{formatMessage(messages.mypaper)}</h1>
            <PageHeaderWrapper wrapperClassName="wrapperMain">
              <div />
            </PageHeaderWrapper>
          </div>  
      )
    }
}

export default mypaper