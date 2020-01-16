/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-02
 * Time: AM 09:32
 * Explain: 行政班空数据的情况下
 *
 * */
import React, { Component } from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import router from 'umi/router';
import studentHead from '@/assets/class/student_head.png';
import styles from './index.less';

// 国际化适配方式
const messages = defineMessages({
  adminNoData: { id: 'app.menu.classallocation.adminNoData', defaultMessage: '您的班级还没有学生哦，快快添加或导入学生吧！' },
  noAdminNoData: { id: 'app.menu.classallocation.noAdminNoData', defaultMessage: '管理员还没有添加学生' },
});

class AdminNoData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showAdminlist: props.curAdminlist,
    };
  }

  // 行政班-选择单个数据内容
  selectedClass = (curItem) => {
    router.push({
      pathname: `/classallocation/classmanage/classwork/${curItem.naturalClassId}`,
      state: {
        adminId: curItem.id,
        curItem,
      },
    });
  };

  // jsx语法视图渲染
  render() {
    const { showAdminlist } = this.state;
    const { curItem } = this.props;
    return (
      <div className={styles.adminNoData}>
        <img className={styles.classImg} src={studentHead} alt='' />
        <div hidden={showAdminlist !== 'adminNolist'}>
          {formatMessage(messages.adminNoData)}
        </div>
        <div hidden={showAdminlist === 'adminNolist'}>
          {formatMessage(messages.noAdminNoData)}
        </div>
        <div className={styles.manager} hidden={showAdminlist !== 'adminNolist'}>
          <div className={styles.position}>
            <div onClick={() => this.selectedClass(curItem)}>
              <i className="iconfont icon-config" />
              <span>{formatMessage({id:"app.menu.classallocation.classwork",defaultMessage:"班务管理"})}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AdminNoData;
