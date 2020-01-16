/**
 *
 * User: tina.zhang
 * Explain: 教学班管理-内容头部信息(搜索)
 *
 * */
import React, { Component } from 'react';
import { Tooltip } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import { connect } from 'dva';
import SearchBar from '@/components/SearchBar';
import questionMark from '@/assets/class/question_mark.png';
import adminAvatar from '@/assets/class/admin_avatar.png';
import pencil from '@/assets/class/pencil.png';
import router from 'umi/router';
import styles from './index.less';

const messages = defineMessages({
  searchGroup: { id: 'app.menu.teachClass.searchGroup', defaultMessage: '请输入学生姓名或学号进行搜索' },
});

@connect(({ clzss }) => ({
  filterTeachStudent: clzss.filterTeachStudent,
  teachingStudents: clzss.teachingStudents,
  teachLastDays: clzss.teachLastDays,
  teachName: clzss.teachName,
  teachingID: clzss.teachingID,
}))
class HeadContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hideSelected: props.curSelected, // 非管理员隐藏
      selectedItem: props.curItem,
    };
  }


  // 显示设置别名弹框组件
  showEditAliasesModal = (flag, curAlias, curId) => {
    const { aliasesModalVisible } = this.props;
    aliasesModalVisible(flag, curAlias, curId);
  };

  // 显示批量更新学号弹框组件
  showUpdateNumberModal = flag => {
    const { numberModalVisible } = this.props;
    numberModalVisible(flag);
  };

  gotoClasswork = (grade, id, lastDays, curAlias, subjectId) => {
    const {curItem} = this.props;
    router.push({
      pathname: `/classallocation/classmanage/teaching/${id}/ClassWork`,
      state: {
        grade, id, lastDays, curAlias, subjectId,curItem
      },
    });
  };

  // 搜索
  onSearchKey = (value) => {

    const { dispatch, teachingStudents } = this.props;
    const students = teachingStudents.filter(item => item.studentClassCode && item.studentClassCode.indexOf(value) > -1 || item.studentName && item.studentName.indexOf(value) > -1);
    if (value !== '') {
      dispatch({
        type: 'clzss/filterTeachStudents',
        payload: {
          filterTeachStudent: students,
        },
      });
    }
    else {
      dispatch({
        type: 'clzss/filterTeachStudents',
        payload: {
          filterTeachStudent: teachingStudents,
        },
      });
    }
  };

  render() {
    const { teacherList, teachLastDays, teachName, teachingStudents } = this.props;
    const { hideSelected, selectedItem } = this.state;
    const curId = hideSelected === 'teaching' ? selectedItem.teachingClassId : selectedItem.naturalClassId;

    return (
      <div className={styles.headContent}>
        <div className={styles.avatar}>
          <img
            className={styles.adminAvatar}
            src={adminAvatar}
            alt=""
            hidden={hideSelected === 'noAdmin' || hideSelected === 'teaching'}
          />
          <span>{teachName}</span>
          <img
            onClick={() => this.showEditAliasesModal(true, teachName, curId)}
            className={styles.pencil}
            src={pencil}
            alt=""
            hidden={hideSelected === 'noAdmin'}
          />
        </div>
        <div className={styles.baseInfo}>
          <div className={styles.number}>
            {formatMessage({id:"app.text.classManage.Class.Number",defaultMessage:"班群号"})}：<span>{selectedItem.classNumber}</span>
            <Tooltip placement="top" title={formatMessage({id:"app.text.classManage.Students.join",defaultMessage:"学生可通过班群号加入本班"})}>
              <img src={questionMark} alt="" />
            </Tooltip>
          </div>
          <div className={styles.line} />
          <div className={styles.student}>
            {formatMessage({id:"app.text.classManage.student",defaultMessage:"学生"})}：<span>{teachingStudents.length}人</span>
          </div>
          <div
            className={styles.line}
            hidden={hideSelected !== 'teaching'}
          />

          <div className={styles.grade} hidden={hideSelected !== 'teaching'}>
            {formatMessage({id:"app.campus.manage.basic.grade",defaultMessage:"年级"})}：<span>{selectedItem.gradeAlias||selectedItem.gradeValue}</span>
          </div>
          <div className={styles.line} hidden={hideSelected !== 'teaching'} />
          <div className={styles.english} hidden={hideSelected !== 'teaching'}>
            {formatMessage({id:"app.menu.classmanage.selectedSubject",defaultMessage:"学科"})}：<span>{selectedItem.subjectName}</span>
          </div>
        </div>
        <div className={styles.search} hidden={teachingStudents.length === 0}>
          <div className={styles.userName}>
            <SearchBar
              placeholder={formatMessage(messages.searchGroup)}
              onSearch={data => this.onSearchKey(data)}
              onChange={data => this.onSearchKey(data)}
            />
          </div>
          <div className={styles.goto}>

            <div
              className={styles.line}
              hidden={hideSelected === 'teaching' || hideSelected === 'noAdmin'}
            />
            <div className={styles.update_btn} hidden={hideSelected === 'noAdmin'}>
              <div className={styles.position} onClick={() => this.showUpdateNumberModal(true)}>
                <i className={`iconfont icon-group ${styles.studentID}`} />
                <i className={`iconfont icon-group ${styles.studentIDHover}`} />
                <span>{formatMessage({id:"app.text.classManage.Renewal.Student.Number",defaultMessage:"更新学号"})}</span>
              </div>
            </div>
            <div className={styles.manager} hidden={hideSelected === 'noAdmin'}>
              <div
                className={styles.position}
                onClick={() => this.gotoClasswork(selectedItem.grade,selectedItem.id, teachLastDays, teachName, selectedItem.subjectId)}
              >
                <i className="iconfont icon-config" />
                <span>{formatMessage({id:"app.menu.classallocation.classwork",defaultMessage:"班务管理"})}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default HeadContent;
