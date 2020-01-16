
// 小组无学生
import React, { Component } from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import { Button} from 'antd';
import cs from "classnames";
import nonePaper from "@/assets/none_user_pic.png";
import styles from '../index.less'


const messages = defineMessages({
  NoData:{id:'app.menu.learninggroup.NoData',defaultMessage:'学习小组还没有学生哦，快快添加吧！'},
  paperAdd:{id:'app.menu.learninggroup.paperAdd',defaultMessage:'添加学生'},
 
})



class NoData extends Component {
    state = {
    };

      componentWillMount() {
        
    }

    

    render() {
        const {addStudent} = this.props;
        
        return (
          <div className={styles.noData}>
            <img className={styles.paperImg} src={nonePaper} alt='' />
            {formatMessage(messages.NoData)}<br />
            <Button className={cs('addStudents',styles.addStudents)} onClick={addStudent}><i className="iconfont icon-add" />{formatMessage(messages.paperAdd)}</Button>
          </div>
         
        )
    }
}

export default NoData