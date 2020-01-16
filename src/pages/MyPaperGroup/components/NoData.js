
// 无试卷包列表
import React, { Component } from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import { Button} from 'antd';
import nonePaper from "@/assets/none_asset_icon.png";
import styles from './index.less'


const messages = defineMessages({
  NoData:{id:'app.menu.papermanage.noData',defaultMessage:'您还没有添加试卷包哦~'},
  paperAdd:{id:'app.menu.papermanage.paperAdd',defaultMessage:'添加试卷包'},
 
})



class NoData extends Component {
    state = {
    };

      componentWillMount() {
        
    }

    

    render() {
        const {addTeach} = this.props;
        const isAdmin=localStorage.getItem('isAdmin');
        const isSubjectAdmin=localStorage.getItem('isSubjectAdmin');
        return (
          <div className={styles.noData}>
            <img className={styles.paperImg} src={nonePaper} alt='' />
            {formatMessage(messages.NoData)}<br />
            {(isAdmin==='true'||isSubjectAdmin==='true')&&<Button className={styles.add} onClick={addTeach}><i className="iconfont icon-add" />{formatMessage(messages.paperAdd)}</Button>}
          </div>
         
        )
    }
}

export default NoData