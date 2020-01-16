/* eslint-disable no-shadow */
/* eslint-disable react/no-array-index-key */
/* eslint-disable prefer-destructuring */
/* eslint-disable eqeqeq */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable react/no-unused-state */
/**
 * 班级卡片
 * @author tina.zhang
 */
import React, { PureComponent } from 'react';
import { Tabs, List } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import emitter from '@/utils/ev';
import './index.less';
import NoData from '@/components/NoData/index';
import noneicon from '@/assets/none_asset_icon.png';
import SelectCard from './SelectCard';
import StudentsList from '../../Configuration/StudentListModal/index';

const { TabPane } = Tabs;

@connect(({ release }) => ({
  classList: release.classList,
  choosedNum: release.choosedNum,
  classType: release.classType,
  mystudentListNumber: release.mystudentListNum,
  taskType: release.taskType,
}))
class ClassSelectCard extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      checkedValue: [],
      natural: false,
      stratidied: false,
      checkedValueID: [],
      classIDList: [],
      visible: false,
      classInfo: {},
      gradeIndex: window.gradeIndex || '0',
      classIndex: -1,
      groupIndex: -1,
    };
  }

  /**
   *更新班级信息
   *
   * @author tina.zhang
   * @date 2019-04-18
   * @param {*} gradeIndex 年级
   * @param {*} classIndex 班级
   * @param {*} e 是否选择
   * @memberof ClassSelectCard
   */
  updateClassList = (
    gradeIndex,
    classIndex,
    groupIndex,
    e,
    updatetype = '',
    mydata = undefined
  ) => {
    const { classList, type, dispatch, classType, taskType } = this.props;
    const newClassList = JSON.parse(JSON.stringify(classList));
    let studentList = [];
    let studentListNum = 0;
    if (type === 'learningGroup') {
      if (mydata) {
        newClassList[type][gradeIndex].classList[classIndex].learningGroupList[
          groupIndex
        ].studentList = mydata;
      }
      studentList =
        newClassList[type][gradeIndex].classList[classIndex].learningGroupList[groupIndex]
          .studentList;
      newClassList[type][gradeIndex].classList[classIndex].learningGroupList[groupIndex].campusId =
        newClassList[type][gradeIndex].campusId;
      newClassList[type][gradeIndex].classList[classIndex].learningGroupList[
        groupIndex
      ].classType = classType;
      newClassList[type][gradeIndex].classList[classIndex].learningGroupList[groupIndex].classId =
        newClassList[type][gradeIndex].classList[classIndex].learningGroupList[
          groupIndex
        ].learningGroupId;
      newClassList[type][gradeIndex].classList[classIndex].learningGroupList[groupIndex].className =
        newClassList[type][gradeIndex].classList[classIndex].learningGroupList[groupIndex].name;
      for (const i in studentList) {
        if (studentList[i].status && updatetype != 'choose') {
          if (studentList[i].status == 'Y') {
            studentListNum += 1;
          }
        } else {
          studentListNum += 1;
          studentList[i].status = 'Y';
        }
        const classIndexStr = newClassList[type][gradeIndex].classList[classIndex].classIndex;
        const classIndexCode = classIndexStr.replace(/^[0]/, '');
        studentList[i].examNo = classIndexCode + studentList[i].studentClassCode;
      }
      if (!e) {
        studentListNum = 0;
      }
      newClassList[type][gradeIndex].classList[classIndex].learningGroupList[
        groupIndex
      ].choosedNum = studentListNum;
      if (e && studentListNum != 0) {
        newClassList[type][gradeIndex].isChoosed = true;
        newClassList[type][gradeIndex].classList[classIndex].isChoosed = true;
        newClassList[type][gradeIndex].classList[classIndex].learningGroupList[
          groupIndex
        ].isChoosed = true;
      } else {
        // newClassList[type][gradeIndex].isChoosed = false;
        // newClassList[type][gradeIndex].classList[classIndex].isChoosed = false;
        newClassList[type][gradeIndex].classList[classIndex].learningGroupList[
          groupIndex
        ].isChoosed = false;
      }
    } else {
      if (mydata) {
        newClassList[type][gradeIndex].classList[classIndex].studentList = mydata;
      }
      studentList = newClassList[type][gradeIndex].classList[classIndex].studentList;

      newClassList[type][gradeIndex].classList[classIndex].campusId =
        newClassList[type][gradeIndex].campusId;
      newClassList[type][gradeIndex].classList[classIndex].classType = classType;

      for (const i in studentList) {
        if (
          newClassList[type][gradeIndex].classList[classIndex].studentList[i].status &&
          updatetype != 'choose'
        ) {
          if (newClassList[type][gradeIndex].classList[classIndex].studentList[i].status == 'Y') {
            studentListNum += 1;
          }
        } else {
          studentListNum += 1;
          newClassList[type][gradeIndex].classList[classIndex].studentList[i].status = 'Y';
        }
        const classIndexStr = newClassList[type][gradeIndex].classList[classIndex].classIndex;
        const classIndexCode = classIndexStr.replace(/^[0]/, '');
        newClassList[type][gradeIndex].classList[classIndex].studentList[i].examNo =
          classIndexCode + studentList[i].studentClassCode;
      }

      if (!e) {
        studentListNum = 0;
      }
      newClassList[type][gradeIndex].classList[classIndex].choosedNum = studentListNum;
      if (e && studentListNum != 0) {
        newClassList[type][gradeIndex].isChoosed = true;
        newClassList[type][gradeIndex].classList[classIndex].isChoosed = true;
      } else {
        // newClassList[type][gradeIndex].isChoosed = false;
        newClassList[type][gradeIndex].classList[classIndex].isChoosed = false;
      }
    }

    const params = {
      payload: { ...newClassList, grade: newClassList[type][gradeIndex] },
      type: 'release/saveClassInfo',
    };

    dispatch(params).then(() => {
      if (taskType && taskType === 'TT_5') {
        emitter.emit('examUpdateClassInfo', {}); // 组件之间通信
      }
    });
  };

  onClosed = () => {
    this.setState({ visible: false });
  };

  renderCard(item, index) {
    const { type } = this.props;
    const { gradeIndex } = this.state;
    if (type === 'learningGroup') {
      return (
        <div>
          <div>{item.className}</div>
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 1,
              md: 1,
              lg: 2,
              xl: 3,
              xxl: 4,
            }}
            dataSource={item.learningGroupList}
            renderItem={(m, groupIndex) => (
              <List.Item>
                <SelectCard
                  dataSource={m}
                  checked={m.isChoosed}
                  choosedNum={m.choosedNum || 0}
                  total={m.studentList.length}
                  update={e => {
                    this.updateClassList(gradeIndex, index, groupIndex, e, 'choose');
                  }}
                  showModal={e => {
                    this.setState({
                      classInfo: e,
                      visible: true,
                      classIndex: index,
                      groupIndex,
                    });
                  }}
                />
              </List.Item>
            )}
          />
        </div>
      );
    }
    return (
      <SelectCard
        dataSource={item}
        checked={item.isChoosed}
        choosedNum={item.choosedNum || 0}
        total={item.studentList.length}
        update={e => {
          this.updateClassList(gradeIndex, index, -1, e, 'choose');
        }}
        showModal={e => {
          this.setState({
            classInfo: e,
            visible: true,
            classIndex: index,
          });
        }}
      />
    );
  }

  render() {
    const { dataSource, choosedNum, type } = this.props;
    const { visible, classInfo, gradeIndex, classIndex, groupIndex } = this.state;
    if (dataSource == undefined || dataSource.length == 0) {
      return (
        <NoData
          noneIcon={noneicon}
          tip={formatMessage({
            id: 'app.message.exam.publish.search.no.data.tip',
            defaultMessage: '没有查询到任何班级',
          })}
        />
      );
    }
    if (dataSource.length > 1) {
      return (
        <div className="card-container">
          {visible && (
            <StudentsList
              visible={visible}
              key={visible}
              students={classInfo.studentList || []}
              classTitle={classInfo.className || classInfo.name}
              classID={classInfo.classId}
              checkStudentList={[]}
              onClose={() => {
                this.onClosed();
              }}
              update={(e, data) => {
                this.updateClassList(gradeIndex, classIndex, groupIndex, e, '', data);
              }}
            />
          )}
          <Tabs
            defaultActiveKey={gradeIndex}
            animated={false}
            tabPosition="left"
            onChange={e => {
              window.gradeIndex = e;
              this.setState({ gradeIndex: e });
            }}
          >
            {dataSource.map((item, index) => {
              return (
                <TabPane
                  tab={item.gradeValue}
                  key={index}
                  disabled={gradeIndex != index && choosedNum > 0}
                >
                  {type == 'learningGroup' ? (
                    item.classList.map((m, index) => {
                      return <div className="learningGroup">{this.renderCard(m, index)}</div>;
                    })
                  ) : (
                    <List
                      grid={{
                        gutter: 16,
                        xs: 1,
                        sm: 1,
                        md: 1,
                        lg: 2,
                        xl: 3,
                        xxl: 4,
                      }}
                      dataSource={item.classList}
                      renderItem={(m, index) => <List.Item>{this.renderCard(m, index)}</List.Item>}
                    />
                  )}
                </TabPane>
              );
            })}
          </Tabs>
        </div>
      );
    }

    return (
      <div className="card-container">
        {visible && (
          <StudentsList
            visible={visible}
            key={visible}
            students={classInfo.studentList || []}
            classTitle={classInfo.className || classInfo.name}
            classID={classInfo.classId}
            checkStudentList={[]}
            onClose={() => {
              this.onClosed();
            }}
            update={(e, data) => {
              this.updateClassList(gradeIndex, classIndex, groupIndex, e, '', data);
            }}
          />
        )}
        {type == 'learningGroup' ? (
          dataSource[0].classList.map((m, index) => {
            return <div className="learningGroup">{this.renderCard(m, index)}</div>;
          })
        ) : (
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 1,
              md: 1,
              lg: 2,
              xl: 3,
              xxl: 4,
            }}
            dataSource={dataSource[0].classList}
            renderItem={(item, index) => <List.Item>{this.renderCard(item, index)}</List.Item>}
          />
        )}
      </div>
    );
  }
}

export default ClassSelectCard;
