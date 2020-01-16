
import React, { Component } from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import { Button} from 'antd';
import { Link } from 'dva/router';
import styles from './index.less'


const messages = defineMessages({
  NoData:{id:'app.teacher.account.noData',defaultMessage:'暂无教师信息，请先添加或导入教师信息。'},
  Add:{id:'app.teacher.account.add',defaultMessage:'添加'},
  Import:{id:'app.teacher.account.import',defaultMessage:'导入'},
 
})



class NoData extends Component {
    state = {
    };

      componentWillMount() {
        
    }

    

    render() {
        const {addTeach} = this.props;
        return (
          <div className={styles.noData}>
            <i className="iconfont icon-file" />
            {formatMessage(messages.NoData)}<br />
            <Button className={styles.add} onClick={addTeach}><i className="iconfont icon-add" />{formatMessage(messages.Add)}</Button>
            <Link to="/campusmanage/teacherMange/import"><Button className={styles.upload}><i className="iconfont icon-upload" />{formatMessage(messages.Import)}</Button></Link>
            
          </div>
         
        )
    }
}

export default NoData