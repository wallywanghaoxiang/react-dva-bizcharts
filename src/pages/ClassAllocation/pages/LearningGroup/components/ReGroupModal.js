import React, { Component } from 'react';
import { Modal, Select, message, Button } from 'antd';
import { connect } from 'dva';
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';

const { Option } = Select;
const { confirm } = Modal;
// formatMessage(
const messages = defineMessages({
  cancel: { id: 'app.cancel', defaultMessage: '取消' },
  submit: { id: 'app.submit', defaultMessage: '确认' },
  reGroup: { id: 'app.menu.learninggroup.reGroup', defaultMessage: '重新分组' },
  cancelGroup: { id: 'app.menu.learninggroup.cancelGroup', defaultMessage: '取消分组' },
  addCurrentGroup: { id: 'app.menu.learninggroup.addCurrentGroup', defaultMessage: '加入现有小组' },
  cancelGroupSucess: {
    id: 'app.menu.learninggroup.cancelGroupSucess',
    defaultMessage: '取消小组成功！',
  },
  moreGroupSucess: {
    id: 'app.menu.learninggroup.moreGroupSucess',
    defaultMessage: '批量重新分组成功！',
  },
  selectedStudentout: {
    id: 'app.menu.learninggroup.selectedStudentout',
    defaultMessage: '您选择的学生将退出',
  },
  yesorno: { id: 'app.menu.learninggroup.yesornoconfirm', defaultMessage: '小组，是否确认？' },
});

@connect(({ learn }) => {
  const {
    changeGroupData,
    naturalClassId,
    currentGroupName,
    groupList,
    currentLearnGroupID,
  } = learn;
  return { changeGroupData, currentGroupName, naturalClassId, groupList, currentLearnGroupID };
})
class ReGroupModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showVisible: false,
      changeGroupID: '',
    };
  }

  componentDidMount() {}

  onHandleCancel = () => {
    // 取消分组
    const { hideModal, currentGroupName, changeGroupData } = this.props;
    const that = this;
    const { dispatch } = this.props;
    confirm({
      title: '',
      content: (
        <div className="cont">
          <span>{formatMessage(messages.selectedStudentout)}</span>
          <span className="name">{currentGroupName}</span>
          <span> {formatMessage(messages.yesorno)}</span>
        </div>
      ),
      okText: formatMessage({ id: 'app.button.comfirm', defaultMessage: '确认' }),
      cancelText: formatMessage(messages.cancel),
      onOk() {
        const idList = [];
        changeGroupData.forEach(item => {
          idList.push(item.id);
        });
        dispatch({
          type: 'learn/cancelGroup',
          payload: idList,
          callback: res => {
            const x = typeof res === 'string' ? JSON.parse(res) : res;
            const { responseCode, data } = x;
            if (responseCode === '200') {
              that.fetchGroup();
              message.success(formatMessage(messages.cancelGroupSucess));
            } else {
              message.error(data);
            }
          },
        });
      },
      onCancel() {},
    });
    hideModal();
  };

  // 重新分组
  onHandleOK = () => {
    const { groupList, currentLearnGroupID } = this.props;
    const groupMyList = [];
    let naturalClassID = '';
    if (groupList && groupList.length > 0) {
      groupList.forEach(item => {
        if (item.learningGroupList.length > 0) {
          item.learningGroupList.forEach(vo => {
            if (vo.learningGroupId === currentLearnGroupID) {
              naturalClassID = item.naturalClassId;
            }
          });
        }
      });
      console.log(naturalClassID);
      groupList.forEach(item => {
        if (item.learningGroupList.length > 0) {
          item.learningGroupList.forEach(vo => {
            console.log(
              item.naturalClassId,
              naturalClassID,
              currentLearnGroupID,
              vo.learningGroupId
            );
            if (
              item.naturalClassId === naturalClassID &&
              currentLearnGroupID !== vo.learningGroupId
            ) {
              groupMyList.push(vo);
            }
          });
        }
      });
    }
    this.setState({
      changeGroupID: groupMyList.length > 0 ? groupMyList[0].learningGroupId : '',
    });
    const { hideModal } = this.props;
    this.setState({
      showVisible: true,
    });
    hideModal();
  };

  onHandleOKAdd = () => {
    // 加入现有小组
    const { changeGroupData, dispatch } = this.props;
    const { changeGroupID } = this.state;
    const that = this;
    console.log(changeGroupData);
    const result = changeGroupData.map(item => {
      return {
        ...item,
        learningGroupId: changeGroupID,
      };
    });
    console.log(result);
    dispatch({
      type: 'learn/moreReLearnGroup',
      payload: result,
      callback: res => {
        const x = typeof res === 'string' ? JSON.parse(res) : res;
        const { responseCode, data } = x;
        if (responseCode === '200') {
          that.fetchGroup();
          message.success(
            formatMessage({ id: 'app.message.regroupingSuccess', defaultMessage: '重新分组成功' })
          );
        } else {
          message.error(data);
        }
      },
    });

    this.setState({
      showVisible: false,
    });
  };

  // 获取小组列表 以及该小组里的学生列表
  fetchGroup = () => {
    const { dispatch, currentLearnGroupID, naturalClassId } = this.props;
    dispatch({
      type: 'learn/fetchGroupList',
      payload: {
        campusId: localStorage.getItem('campusId'),
        teacherId: localStorage.getItem('teacherId'),
      },
    });
    dispatch({
      type: 'learn/fetchStudentList',
      payload: {
        id: currentLearnGroupID,
      },
    });
    dispatch({
      type: 'learn/fetchNaturalClassList',
      payload: {
        naturalClassId,
        campusId: localStorage.getItem('campusId'),
        teacherId: localStorage.getItem('teacherId'),
      },
    });
  };

  onHandleCurrentCancel = () => {
    this.setState({
      showVisible: false,
    });
    const { reGroup } = this.props;
    reGroup();
  };

  // 切换分组ID
  setGroupID = values => {
    this.setState({
      changeGroupID: values,
    });
  };

  // 关闭重新分组弹窗

  onHandleClose = () => {
    const { hideModal } = this.props;
    hideModal();
  };

  render() {
    const { visible } = this.props;
    const { showVisible, changeGroupID } = this.state;

    const { groupList, currentLearnGroupID } = this.props;
    const groupMyList = [];
    let naturalClassID = '';
    if (groupList && groupList.length > 0) {
      groupList.forEach(item => {
        if (item.learningGroupList.length > 0) {
          item.learningGroupList.forEach(vo => {
            if (vo.learningGroupId === currentLearnGroupID) {
              naturalClassID = item.naturalClassId;
            }
          });
        }
      });
      console.log(naturalClassID);
      groupList.forEach(item => {
        if (item.learningGroupList.length > 0) {
          item.learningGroupList.forEach(vo => {
            console.log(
              item.naturalClassId,
              naturalClassID,
              currentLearnGroupID,
              vo.learningGroupId
            );
            if (
              item.naturalClassId === naturalClassID &&
              currentLearnGroupID !== vo.learningGroupId
            ) {
              groupMyList.push(vo);
            }
          });
        }
      });
    }

    console.log(groupMyList);

    return (
      <div>
        <Modal
          visible={visible}
          centered
          title={formatMessage(messages.reGroup)}
          closable
          width={300}
          maskClosable
          destroyOnClose
          cancelText={formatMessage(messages.cancelGroup)}
          okText={formatMessage(messages.addCurrentGroup)}
          okButtonProps={{ disabled: groupMyList.length === 0 || false }}
          onCancel={this.onHandleClose}
          onOk={this.onHandleOK}
          className={styles.reGroupModal}
        >
          <Button className={styles.reGroupBtn} onClick={this.onHandleCancel}>
            {formatMessage(messages.cancelGroup)}
          </Button>
          <div />
        </Modal>
        <Modal
          visible={showVisible}
          centered
          title={formatMessage(messages.addCurrentGroup)}
          closable={false}
          width={300}
          maskClosable
          destroyOnClose
          cancelText={formatMessage(messages.cancel)}
          okText={formatMessage(messages.submit)}
          onCancel={this.onHandleCurrentCancel}
          onOk={this.onHandleOKAdd}
          className={styles.addCurrentGroupModal}
        >
          <Select style={{ width: 240 }} onChange={this.setGroupID} value={changeGroupID}>
            {groupMyList.map(item => {
              return (
                <Option value={item.learningGroupId} key={item.learningGroupId}>
                  {item.name}
                </Option>
              );
            })}
          </Select>
        </Modal>
      </div>
    );
  }
}

export default ReGroupModal;
