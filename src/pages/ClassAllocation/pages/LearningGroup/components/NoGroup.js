
// 无小组
import React, { Component } from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import { connect } from "dva";
import { Button} from 'antd';
import cs from "classnames";
import nonePaper from "@/assets/none_group_pic.png";
import styles from '../index.less'


const messages = defineMessages({
  NoGroupData:{id:'app.menu.learninggroup.NoGroupData',defaultMessage:'您还没有创建过学习小组'},
  addGroup:{id:'app.menu.learninggroup.addGroup',defaultMessage:'创建小组'},
 
})


@connect(({  learn , loading }) => ({
  loading: loading.effects['learn/fetchGroupList'],
  groupList:learn.groupList,

}))
class NoGroup extends Component {
    state = {
    };

      componentWillMount() {
        
    }

    

    render() {
      const {addGroup,groupList,loading} = this.props;
      const groupMyList = [];
      if(groupList.length>0) {
        groupList.forEach((item)=>{
          if(item.learningGroupList.length>0) {
            item.learningGroupList.forEach((vo)=>{
              groupMyList.push(vo)
            })
          }
        })
      }
        return (
          groupMyList.length===0&&loading===false?
            <div className={styles.noData}>
              <img className={styles.paperImg} src={nonePaper} alt='' />
              {formatMessage(messages.NoGroupData)}<br />
              <Button className={cs('addGroup',styles.addGroup)} onClick={addGroup}><i className="iconfont icon-add" />{formatMessage(messages.addGroup)}</Button>
            </div>
          :''
         
        )
    }
}

export default NoGroup