import React, { Component } from 'react';
import { Modal, Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { showWaiting, hideLoading } from '@/frontlib/utils/utils';
import loadingif from '@/frontlib/assets/loading.gif';
import styles from './index.less';

const { Option } = Select;

@connect(({ editroom, loading }) => ({
  campusInfo: editroom.campusInfo,
  BatchRoom: editroom.BatchRoom,
  layoutStudent: editroom.layoutStudent,
  taskId: editroom.taskId,
  ExamDate: editroom.ExamDate,
  examArrange: loading.effects['editroom/examArrangeOnces'],
}))
class OneClickArrange extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: props.visible,
      defaultExamPlaceId: '请选择',
      defaultExamDated: '请选择',
      Remnant: false,
      RemnantStudent: [], // 还剩多少学生没有编排
    };
  }

  // 保存
  handleCreate = () => {
    const { defaultExamDated, defaultExamPlaceId, RemnantStudent } = this.state;
    const { taskId, dispatch, hideGroups, layoutStudent } = this.props;
    const that = this;
    if (defaultExamPlaceId === '请选择') {
      message.warning('请选择考点！');
    } else if (defaultExamDated === '请选择') {
      message.warning('请选择开始日期！');
    } else {
      showWaiting({
        img: loadingif,
        text: '编排学生中…请稍候',
      });
      dispatch({
        type: 'editroom/examArrangeOnces',
        payload: {
          examDate: defaultExamDated,
          examPlaceId: defaultExamPlaceId,
          studentIdList: RemnantStudent.length > 0 ? RemnantStudent : layoutStudent,
          taskId,
          campusId: localStorage.getItem('campusId'),
        },
        callback: res => {
          // 考点加载开始日期
          dispatch({
            type: 'editroom/getBatchExamDates',
            payload: {
              taskId,
              examPlaceId: defaultExamPlaceId,
              campusId: localStorage.getItem('campusId'),
            },
            callback: () => {
              that.setState({
                defaultExamDated: '请选择',
              });
            },
          });
          if (res.responseCode === '200') {
            // 刷新左侧学校列表后，更新之前所点击的学校Id
            dispatch({
              type: 'editroom/getExamCampus',
              payload: { taskId, campusId: localStorage.getItem('campusId') },
            }).then(() => {
              dispatch({
                type: 'editroom/getExamStatistics',
                payload: { taskId, campusId: localStorage.getItem('campusId') },
              });
            });
            if (res.data.length === 0) {
              message.success(`您已成功编排${layoutStudent.length}名考生！`);
              this.setState({
                Remnant: false,
              });
              dispatch({
                type: 'editroom/getStudentList',
                payload: {
                  taskId,
                  campusId: localStorage.getItem('campusId'),
                  backStatus: true, // 数据刷新后保持原样
                },
              }).then(() => {
                hideLoading();
                hideGroups();
              });
            } else {
              dispatch({
                type: 'editroom/getStudentList',
                payload: {
                  taskId,
                  campusId: localStorage.getItem('campusId'),
                  backStatus: true, // 数据刷新后保持原样
                },
              }).then(() => {
                hideLoading();
              });
              // 还剩部分未编排的学生列表
              this.setState({
                Remnant: true,
                RemnantStudent: res.data,
              });
            }
          } else {
            hideLoading();
            message.error(res.data);
            hideGroups();
          }
        },
      });
    }
  };

  handleChange = value => {
    // 选择 考点加载开始日期
    const { dispatch, taskId } = this.props;
    dispatch({
      type: 'editroom/getBatchExamDates',
      payload: {
        taskId,
        examPlaceId: value,
        campusId: localStorage.getItem('campusId'),
      },
    });
    this.setState({
      defaultExamPlaceId: value,
    });
  };

  handleChangeDate = value => {
    this.setState({
      defaultExamDated: value,
    });
  };

  // 日期转换
  dateToYMD = data => {
    const M = new Date(data).getMonth() + 1;
    const D = new Date(data).getDate();
    return `${M}月${D}日`;
  };

  render() {
    const {
      hideGroups,
      layoutStudent,
      BatchRoom: { examPlaceList },
      examArrange,
      ExamDate,
    } = this.props;
    const { visible, defaultExamPlaceId, Remnant, RemnantStudent, defaultExamDated } = this.state;
    return (
      <Modal
        visible={visible}
        centered
        width={360}
        title={formatMessage({ id: 'app.text.one.click.manage.exam', defaultMessage: '一键编排' })}
        okText={
          Remnant
            ? formatMessage({ id: 'app.text.go.on.exam.batch', defaultMessage: '继续编排' })
            : formatMessage({ id: 'app.text.start.exam.Arrangement', defaultMessage: '开始编排' })
        }
        onCancel={hideGroups}
        onOk={this.handleCreate}
        maskClosable={false}
        closable={false}
        className={styles.OneClickArrange}
        okButtonProps={{ disabled: examArrange }}
      >
        {Remnant && (
          <div className={styles.warning}>
            <i className="iconfont icon-tip" />
            您选择的考点、日期已安排{layoutStudent.length - RemnantStudent.length}人，还剩
            {RemnantStudent.length}人待安排
          </div>
        )}
        {!Remnant && <div className={styles.waitArrange}>待安排：{layoutStudent.length}人</div>}
        <div className={styles.selectTitle}>选择考点</div>
        <Select
          defaultValue={defaultExamPlaceId}
          style={{ width: 300 }}
          onChange={this.handleChange}
        >
          {examPlaceList.map(vo => (
            <Option value={vo.examPlaceId} key={vo.examPlaceId}>
              {vo.examPlaceName}
            </Option>
          ))}
        </Select>
        {ExamDate.length > 0 && defaultExamPlaceId !== '请选择' && (
          <div className={styles.selectTitle}>选择开始日期</div>
        )}
        {ExamDate.length > 0 && defaultExamPlaceId !== '请选择' && (
          <Select value={defaultExamDated} style={{ width: 300 }} onChange={this.handleChangeDate}>
            {ExamDate.map(vo => (
              <Option value={vo.examDate} key={vo.examDate} disabled={!vo.leftNum}>
                {!vo.leftNum && <span className={styles.expired}>已满</span>}
                {this.dateToYMD(vo.examDate)}
              </Option>
            ))}
          </Select>
        )}
      </Modal>
    );
  }
}

export default OneClickArrange;
