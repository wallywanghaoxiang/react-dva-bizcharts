/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-03-29
 * Time: PM 15:17
 * Explain: 行政班管理-内容头部信息(搜索)
 *
 * */
import React, { Component } from 'react';
import { Tooltip } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import SearchBar from '@/components/SearchBar';
import adminAvatar from '@/assets/class/admin_avatar.png';
import router from 'umi/router';
import { connect } from 'dva/index';
import ShowAvatar from './ShowAvatar'
import styles from './index.less';

// 国际化适配方式
const messages = defineMessages({
  searchGroup: { id: 'app.menu.teachClass.searchGroup', defaultMessage: '请输入学生姓名或学号进行搜索' },
});

// style行内样式的初始化
const conTextTip = {
  display: 'flex',
  width: 'auto',
};
const nameTip = {
  fontSize: 18,
};
const imgTip = {
  width: 20,
  height: 20,
  marginLeft: 4,
  marginRight: 4,
  position: 'relative',
  top: 3,
};
const subjectListTip = {
  position: 'relative',
  top: 4,
  display: 'flex',
};
const subjectTip = {
  width: 40,
  height: 20,
  paddingRight: 2,
  paddingLeft: 2,
  borderRadius: 13,
  border: 1,
  borderStyle: 'double',
  fontSize: 12,
  position: 'relative',
  left: 4,
};
const subjectSpanTip = {
  position: 'relative',
  left: 6,
};

// connect方法可以拿取models中state值
@connect(({ clzss }) => ({
  filterTeachStudent: clzss.filterTeachStudent,
  naturalClass:clzss.naturalClass,
  adminStudents: clzss.adminStudents,
  adminLastDays: clzss.adminLastDays,
}))
class HeadContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hideSelected: props.curSelected, // 非管理员隐藏
    };
  }

  // 显示设置别名弹框组件
  showEditAliasesModal = (flag, alias, curId) => {
    const { aliasesModalVisible } = this.props;
    aliasesModalVisible(flag, alias, curId);
  };

  // 显示批量更新学号弹框组件
  showUpdateNumberModal = flag => {
    const { numberModalVisible } = this.props;
    numberModalVisible(flag);
  };

  // 跳转到班务管理
  gotoClasswork = (list, curItem) => {
    const { adminLastDays,naturalClass } = this.props;
    const {teachingClass} = naturalClass
    sessionStorage.setItem('curAlias', '')
    sessionStorage.setItem('className', '')
    router.push({
      pathname: `/classallocation/classmanage/classwork/${curItem.naturalClassId}`,
      state: {
        list,
        curItem,
        adminLastDays,
        teachingClass
      },
    });
  };

  // 跳转到我的分组页面
  gotoMyGrouping = (selectedItem) => {
    const { adminLastDays } = this.props;
    sessionStorage.setItem('curAlias', '')
    sessionStorage.setItem('className', '')
    router.push({
      pathname: '/classallocation/classmanage/mygrouping',
      state: {
        adminLastDays,
        selectedItem,
      },
    });
  };

  // 搜索
  onSearchKey = (value) => {
    const { dispatch, adminStudents } = this.props;
    const students = adminStudents.filter(item => item.studentClassCode && item.studentClassCode.indexOf(value) > -1 || item.studentName && item.studentName.indexOf(value) > -1);
    if (value !== '') {
      dispatch({
        type: 'clzss/filterTeachStudents',
        payload: {
          filterNaturalClass: students,
        },
      });
    }
    else {
      dispatch({
        type: 'clzss/filterTeachStudents',
        payload: {
          filterNaturalClass: adminStudents,
        },
      });
    }
  };

  // hover消息头提取
  showMessage = student => {
    console.log(student)
    return [
      <div style={conTextTip}>
        <span style={nameTip}>{student.teacherName}</span>
        {student.isOwner === '1' ? <span>
          <img
            style={imgTip}
            src={adminAvatar}
            alt=""
          />
        </span> : null}
        {student && student.subjectList && student.subjectList.length > 0 ? (
          student.subjectList.map(subject => (
            <div style={subjectListTip}>
              <div style={subjectTip}>
                <span style={subjectSpanTip}>{subject.subjectValue}</span>
              </div>
            </div>
          ))
        ) : (
          <span />
        )}
      </div>,
    ];
  };

  // jsx语法视图渲染
  render() {
    const { studentList, adminStudents, teacherList, curItem, alias,naturalClass } = this.props;
    const { hideSelected } = this.state;
    const curId = hideSelected === 'teaching' ? curItem.teachingClassId : curItem.naturalClassId;
    console.log(hideSelected,naturalClass)
    return (
      <div className={styles.headContent}>
        <div className={styles.avatar}>
          <img
            className={styles.adminAvatar}
            src={adminAvatar}
            alt=""
            hidden={hideSelected === 'noAdmin' || hideSelected === 'teaching'}
          />
          <Tooltip title={naturalClass.alias || naturalClass.className}> <span>{naturalClass.alias || naturalClass.className}</span></Tooltip>
          <i
            onClick={() => this.showEditAliasesModal(true, alias, curId)}
            className="iconfont icon-edit"
            hidden={hideSelected === 'noAdmin'}
          />
        </div>
        <div className={styles.baseInfo}>
          <div className={styles.number}>
            {formatMessage({id:"app.text.classManage.Class.Number",defaultMessage:"班群号"})}：<span>{naturalClass.classNumber}</span>
            <Tooltip placement="top" title={formatMessage({id:"app.text.classManage.Students.join",defaultMessage:"学生可通过班群号加入本班"})}>
              <i className="iconfont icon-help" />
            </Tooltip>
          </div>
          <div className={styles.line} />
          <div className={styles.student}>
            {formatMessage({id:"app.text.classManage.student",defaultMessage:"学生"})}：<span>{naturalClass&&naturalClass.studentList&&naturalClass.studentList.length||0}人</span>
          </div>
          <div
            className={styles.line}
            hidden={hideSelected === 'teaching' || teacherList.length === 0}
          />
          <div
            className={styles.teacher}
            hidden={hideSelected === 'teaching' || teacherList.length === 0}
          >
            {formatMessage({id:"app.text.classManageTeacher",defaultMessage:"教师"})}：
            <span>
              {teacherList.length > 0 ? (
                teacherList.map(item => (
                 
                  <ShowAvatar item={item} key={item.accountId} />
                  
                ))
              ) : (
                <span />
              )}
            </span>
          </div>
          <div className={styles.line} hidden={hideSelected !== 'teaching'} />
          <div className={styles.grade} hidden={hideSelected !== 'teaching'}>
            {formatMessage({id:"app.campus.manage.basic.grade",defaultMessage:"年级"})}：<span>{curItem.gradeAlias}</span>
          </div>
          <div className={styles.line} hidden={hideSelected !== 'teaching'} />
          <div className={styles.english} hidden={hideSelected !== 'teaching'}>
            {formatMessage({id:"app.menu.classmanage.selectedSubject",defaultMessage:"学科"})}：<span>{curItem.subjectName}</span>
          </div>
        </div>
        <div className={styles.search}>
          <div className={styles.userName}>
            {(adminStudents && adminStudents.length > 0) && <SearchBar
              placeholder={formatMessage(messages.searchGroup)}
              onSearch={data => this.onSearchKey(data)}
              onChange={data => this.onSearchKey(data)}
            />}
          </div>
          <div className={styles.goto} hidden={studentList.length === 0}>
            <div className={styles.grouping} hidden={hideSelected === 'teaching'}>
              <div className={styles.position} onClick={() => this.gotoMyGrouping(curItem)}>
                <i className="iconfont icon-layer" />
                <span>{formatMessage({id:"app.text.classManage.View.my.grouping",defaultMessage:"查看我的分组"})}</span>
              </div>
            </div>
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
              <div className={styles.position} onClick={() => this.gotoClasswork(teacherList, curItem)}>
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
