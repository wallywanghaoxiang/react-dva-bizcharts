/* eslint-disable array-callback-return */
/* eslint-disable consistent-return */
/* eslint-disable react/no-unused-state */
/* eslint-disable eqeqeq */
/**
 * 班级选择
 * @author tina
 */
import React, { PureComponent } from 'react';
import { Tabs } from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import './index.less';
import ClassSelectCard from '../components/ClassSelectCard';

const { TabPane } = Tabs;
@connect(({ release }) => ({
  JointyClassList: release.JointyClassList,
  checkStudentList: release.checkStudentList,
  choosedNum: release.choosedNum,
  taskType: release.taskType,
}))
class ClassSelect extends PureComponent {
  constructor(props) {
    super(props);
    window.ClassSelectCard = props.ClassactiveKey;
    this.state = {
      checkedValue: [],
      natural: false,
      stratidied: false,
      checkedValueID: [],
      classIDList: [],
      activeKey: props.ClassactiveKey,
    };
  }

  onChange = checkedValues => {
    const { checkStudentList } = this.props;
    const checkedID = [];
    if (checkedValues.length == 0) {
      this.setState({
        stratidied: false,
        natural: false,
      });
    }
    checkedValues.map(item => {
      if (item.type == 'NATURAL_CLASS') {
        this.setState({
          stratidied: true,
        });
      } else {
        this.setState({
          natural: true,
        });
      }
      checkedID.push(item.classId);
    });
    this.setState({
      checkedValue: checkedValues,
      checkedValueID: checkedID,
    });
    // 学生列表
    const list = [];
    checkedValues.map(item => {
      const classID = item.classId;
      const classNamed = item.className;
      const classTypes = item.type;
      item.classStudentList.map(vo => {
        let status = false;
        checkStudentList.map(vo2 => {
          if (vo.studentId == vo2.studentId) {
            list.push(vo2);
            status = true;
          }
        });
        if (!status) {
          list.push({
            classId: classID,
            studentId: vo.studentId,
            examNo: vo.examNo,
            studentName: vo.studentName,
            gender: vo.gender,
            status: 'Y',
            className: classNamed,
            classType: classTypes,
          });
        }
      });
    });
    const { dispatch } = this.props;
    dispatch({
      type: 'release/saveStudentList',
      payload: {
        StudentList: list,
      },
    });
  };

  callBack = students => {
    const { checkStudentList } = this.props;
    const studentList = checkStudentList;
    checkStudentList.forEach((item, index) => {
      studentList[index].status = 'Y';
      students.forEach(vo => {
        if (vo == item.studentId) {
          studentList[index].status = 'N';
        }
      });
    });
    const { dispatch } = this.props;
    dispatch({
      type: 'release/saveStudentList',
      payload: {
        StudentList: studentList,
      },
    });
    const { checkedValueID, checkedValue } = this.state;
    const checkedID = checkedValueID;
    checkedValue.forEach((item, index) => {
      const len = studentList.filter(x => {
        if (x.classId == item.classId) {
          return x.status == 'Y';
        }
      }).length;
      checkedID.splice(index, 1);
      if (len != 0) {
        checkedID.push(item.classId);
      }
    });
    this.setState({
      checkedValueID: checkedID,
    });
  };

  showStudent = classID => {
    // 显示当前班级的学生列表
    this.setState({
      classIDList: classID,
    });
  };

  onClosed = () => {
    this.setState({
      classIDList: [],
    });
  };

  render() {
    const { classList, choosedNum, ClassactiveKey, taskType } = this.props;
    const { activeKey } = this.state;
    return (
      <div className="setPaper">
        {taskType === 'TT_3' ? (
          <h2>
            {formatMessage({
              id: 'app.title.exam.publish.select.class',
              defaultMessage: '选择班级',
            })}
            <i className="iconfont icon-tip iconStyle" />
            <span className="classSelectTips">
              {formatMessage({
                id: 'app.text.exam.publish.select.class.tip',
                defaultMessage: '至少包含1个您任教的班级',
              })}
            </span>
          </h2>
        ) : (
          <h2>
            {formatMessage({
              id: 'app.title.exam.publish.select.class',
              defaultMessage: '选择班级',
            })}
          </h2>
        )}

        <Tabs
          defaultActiveKey={ClassactiveKey}
          animated={false}
          onChange={e => {
            this.setState({ activeKey: e });
            window.ClassSelectCard = e;
            window.gradeIndex = 0;
            const { dispatch } = this.props;
            let classType = '';
            if (e === '0') {
              classType = 'NATURAL_CLASS';
            } else if (e === '1') {
              classType = 'TEACHING_CLASS';
            } else {
              classType = 'LEARNING_GROUP';
            }
            dispatch({
              type: 'release/saveClassType',
              payload: classType,
            });
          }}
        >
          <TabPane
            tab={formatMessage({
              id: 'app.menu.classallocation.adminclass',
              defaultMessage: '行政班',
            })}
            key="0"
            disabled={choosedNum > 0 && activeKey != '0'}
          >
            <ClassSelectCard
              dataSource={classList.naturalClass}
              type="naturalClass"
              key={`naturalClass${window.gradeIndex}`}
            />
          </TabPane>
          {classList.teachingClass && classList.teachingClass.length != 0 && (
            <TabPane
              tab={formatMessage({
                id: 'app.menu.classallocation.teachingclass',
                defaultMessage: '教学班',
              })}
              key="1"
              disabled={choosedNum > 0 && activeKey != '1'}
            >
              <ClassSelectCard
                dataSource={classList.teachingClass}
                type="teachingClass"
                key={`teachingClass${window.gradeIndex}`}
              />
            </TabPane>
          )}
          {taskType != 'TT_3' &&
            taskType != 'TT_1' &&
            taskType != 'TT_2' &&
            classList.learningGroup &&
            classList.learningGroup.length != 0 && (
              <TabPane
                tab={formatMessage({
                  id: 'app.menu.classallocation.mygrouping',
                  defaultMessage: '我的分组',
                })}
                key="2"
                disabled={choosedNum > 0 && activeKey != '2'}
              >
                <ClassSelectCard
                  dataSource={classList.learningGroup}
                  type="learningGroup"
                  key={`learningGroup${window.gradeIndex}`}
                />
              </TabPane>
            )}
        </Tabs>
        <div className="bottomText">
          <span className="text1">
            {formatMessage({
              id: 'app.examination.inspect.task.detail.student.exam.number',
              defaultMessage: '应考人数',
            })}
            ：
          </span>
          <span className="text2">{choosedNum}</span>
        </div>
      </div>
    );
  }
}

export default ClassSelect;
