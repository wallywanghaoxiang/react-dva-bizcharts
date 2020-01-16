/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-02
 * Time: AM 16:17
 * Explain: 班务管理为空的情况下
 *
 * */
import React, { Component } from 'react';
import { Tooltip } from 'antd';
import { connect } from 'dva';
import { formatMessage, defineMessages } from 'umi/locale';
import studentHead from '@/assets/class/student_head.png';
import noClicks from '@/assets/class/no_clicks.png';
import people from '@/assets/class/people.png';
import peopleHover from '@/assets/class/people_hover.png';
import peopleDis from '@/assets/class/people_dis.png';
import importDis from '@/assets/class/import_dis.png';
import importHover from '@/assets/class/import_hover.png';
import importIonc from '@/assets/class/import.png';
import router from 'umi/router';
import styles from './index.less';

// 国际化适配方式
const messages = defineMessages({
  isLastDaysNoData: {
    id: 'app.menu.classallocation.isLastDaysNoData',
    defaultMessage: '您的班级还没有学生哦，请先联系管理员给班级开启异动，再添加或导入学生吧！',
  },
  nullLastDaysNoData: { id: 'app.menu.classallocation.nullLastDaysNoData', defaultMessage: '您的班级还没有学生哦，快快添加或导入学生吧！' },
  studentNoData: { id: 'app.menu.classallocation.adminNoData', defaultMessage: '您的班级还没有学生哦，请先联系管理员给班' },
  studentnullNoData: { id: 'app.menu.classallocation.studentnullNoData', defaultMessage: '未搜索到相关学生！' },
});

// connect方法可以拿取models中state值
@connect(({ clzss }) => ({
  adminStudents: clzss.adminStudents,
  adminLastDays: clzss.adminLastDays,
  filterNaturalClass: clzss.filterNaturalClass,
}))

class ClassWorkNoData extends Component {

  // 显示添加学生弹框组件
  showAddStudentModal = (flag) => {
    const { adminLastDays } = this.props;
    if (adminLastDays === 0 || adminLastDays === null) {
      return false;
    }
    const { addStudentModalVisible } = this.props;
    addStudentModalVisible(flag);
  };

  // 显示调入学生弹框组件
  showTransferStudentModal = (flag) => {
    const { adminLastDays } = this.props;
    if (adminLastDays === 0 || adminLastDays === null) {
      return false;
    }
    const { transferStudentModalVisible } = this.props;
    transferStudentModalVisible(flag);
  };

  // 跳转到学生导入
  gotoImportingstudents = () => {
    const { adminLastDays, naturalClassId, curItem } = this.props;
    if (adminLastDays === 0 || adminLastDays === null) {
      return false;
    }
    router.push({
      pathname: `/classallocation/classmanage/importingstudents/${naturalClassId}`,
      state: {
        curItem,
      },
    });
  };

  // jsx语法视图渲染
  render() {
    const { adminLastDays, filterNaturalClass, adminStudents } = this.props;
    const ShowBtnMessage = () => (
      <div>
        {
          (adminLastDays === 0 || adminLastDays === null) ?
            <div style={{ width: '190px', height: '36px', 'line-height': '18px' }}>
              <div>
                <div style={{ fontSize: 13 }}>{formatMessage({id:"app.text.Non-AlternatingPeriodNotOperating",defaultMessage:"非异动期不可操作，如需操作"})}，</div>
                <div style={{ fontSize: 13 }}>{formatMessage({id:"app.text.Pleasecontacttheadministratortoopenthechange",defaultMessage:"请联系管理员开启异动"})}</div>
              </div>
            </div> : null
        }
      </div>
    );
    return (
      <div className={styles.teachingNoData}>
        <img className={styles.classImg} src={studentHead} alt='' />
        {
          (adminStudents && adminStudents.length > 0) && (filterNaturalClass && filterNaturalClass.length === 0) ?
            <div> {formatMessage(messages.studentnullNoData)}</div> : null
        }
        <div hidden={(adminStudents && adminStudents.length > 0)}>
          {(adminLastDays === 0 || adminLastDays === null) ? (
            <div> {formatMessage(messages.isLastDaysNoData)}</div>
          ) : (
            <div> {formatMessage(messages.nullLastDaysNoData)}</div>
          )}
          {(adminLastDays === 0 || adminLastDays === null) ? (
            <div className={styles.goto_dis}>
              <div className={styles.update_btn}>
                <div className={styles.position_stu}>
                  <img className={styles.importDis} src={importDis} alt='' />
                  <span>{formatMessage({id:"app.menu.classallocation.transferStudents",defaultMessage:"调入学生"})}</span>
                </div>
              </div>
              <div className={styles.update_btn}>
                <div className={styles.position}>
                  <span>+</span>
                  <span>{formatMessage({id:"app.menu.classmanage.addStudent",defaultMessage:"添加学生"})}</span>
                </div>
              </div>
              <div className={styles.update_btn}>
                <div className={styles.position_peo}>
                <i className="iconfont icon-upload" />
                  <span>{formatMessage({id:"app.text.classManage.Batch.import",defaultMessage:"批量导入"})}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.goto}>
              <Tooltip placement="top" title={adminLastDays > 0 ? '' : <ShowBtnMessage />}>
                <div
                  className={styles.update_btn}
                  onClick={() => {
                       this.showTransferStudentModal(true);
                     }}
                >
                  <div
                    className={styles.position_stu}
                  >
                    <img className={styles.import} src={importIonc} alt='' />
                    <img className={styles.importHover} src={importHover} alt='' />
                    <span>{formatMessage({id:"app.menu.classallocation.transferStudents",defaultMessage:"调入学生"})}</span>
                  </div>
                </div>
              </Tooltip>
              <Tooltip placement="top" title={adminLastDays > 0 ? '' : <ShowBtnMessage />}>
                <div
                  className={styles.update_btn}
                  onClick={() => {
                       this.showAddStudentModal(true);
                     }}
                >
                  <div
                    className={styles.position}

                  >
                    <span>+</span>
                    <span>{formatMessage({id:"app.menu.classmanage.addStudent",defaultMessage:"添加学生"})}</span>
                  </div>
                </div>
              </Tooltip>
              <Tooltip placement="top" title={adminLastDays > 0 ? '' : <ShowBtnMessage />}>
                <div
                  className={styles.update_btn}
                  onClick={() => {
                       this.gotoImportingstudents();
                     }}
                >
                  <div
                    className={styles.position_peo}       
                  >
                    <i className="iconfont icon-upload" />
                    <span>{formatMessage({id:"app.text.classManage.Batch.import",defaultMessage:"批量导入"})}</span>
                  </div>
                </div>
              </Tooltip>
            </div>
          )}
        </div>

      </div>
    );
  }
}

export default ClassWorkNoData;
