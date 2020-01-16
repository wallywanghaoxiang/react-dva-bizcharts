import React, { Component } from 'react';
import { Modal, Input, List, Select } from 'antd';
import { connect } from 'dva';
import { formatMessage, defineMessages, FormattedMessage } from 'umi/locale';
import ManagerAvatarH from '../ManagerAvatarH/index';
import managerIcon from '@/assets/campus/manager.png';
import styles from './index.less';

const { Search } = Input;
const { Option } = Select;

const messages = defineMessages({
  modalTit: { id: 'app.campus.manage.add.manager.modal.title', defaultMessage: '指定管理员' },
  okText: { id: 'app.campus.manage.add.manager.modal.ok.btn.title', defaultMessage: '指定Ta' },
  cancle: { id: 'app.cancel', defaultMessage: '取消' },
  searchPlaceholder: {
    id: 'app.campus.manage.add.manager.modal.search.placeholder',
    defaultMessage: '请输入姓名搜索教师',
  },
  tip1: { id: 'app.campus.manage.add.manager.modal.tip1', defaultMessage: '未找到该教师' },
  tip2: { id: 'app.campus.manage.add.manager.modal.tip2', defaultMessage: '添加哦~' },
  teacherManage: { id: 'app.menu.teachermanage', defaultMessage: '教师管理' },
});
@connect(({ campusmanage, loading }) => {
  const { subjectTeacherList, gradList } = campusmanage;

  const addLoading = loading.effects['campusmanage/addSubjectManager'];

  return { subjectTeacherList, gradList, addLoading };
})
class AddManagerModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      managerList: [],
      selectItem: '',
      searched: false, // 已搜索
      grade: undefined,
    };
  }

  componentDidMount() {
    // 获取所有年级
    const { dispatch } = this.props;
    dispatch({
      type: 'campusmanage/allGrade',
      payload: {},
    });
  }

  /**
   * 组件内部方法
   */

  handleCancel = () => {
    const { onCancel } = this.props;
    onCancel();
  };

  handleOk = () => {
    const { selectItem, grade } = this.state;
    const { onAddManager } = this.props;
    onAddManager(selectItem, grade);
  };

  modalClose = () => {
    this.setState({
      selectItem: '',
      managerList: [],
      searched: false, // 已搜索
      grade: undefined,
    });
  };

  // 搜索事件
  onSearch = value => {
    const list = this.sortTeacher(value);
    this.setState({
      managerList: list,
      searched: true,
      selectItem: '',
    });
  };

  // 搜索框中的值变化
  handleValueChange = e => {
    const { value } = e.target;
    if (!value) {
      this.setState({
        selectItem: '',
        searched: false,
        managerList: [],
      });
    }
  };

  // 本地搜索
  sortTeacher = value => {
    const { subjectTeacherList } = this.props;
    const list = [];
    if (value) {
      subjectTeacherList.forEach(el => {
        if (el.teacherName.indexOf(value) !== -1) {
          const obj = list.length > 0 ? list.find(item => item.teacherId === el.teacherId) : null;
          if (!obj) {
            list.push(el);
          }
        }
        // if (el.mobile.indexOf(value) !== -1) {
        //   const obj = list.length>0 ? list.find(item => item.teacherId === el.teacherId) : null;
        //   if (!obj) {
        //     list.push(el);
        //   }
        // }
      });
    }
    return list;
  };

  // 选择一个管理员
  selectManager = item => {
    const { selectItem } = this.state;
    const selectObj = !selectItem || selectItem.teacherId !== item.teacherId ? item : '';
    this.setState({
      selectItem: selectObj,
    });
  };

  // 年级变更
  handleGradeChange = value => {
    this.setState({ grade: value });
  };

  render() {
    const { visible, gradList, addLoading } = this.props;
    const { selectItem, managerList, searched, grade } = this.state;
    // eslint-disable-next-line no-unneeded-ternary
    const okButtonDisabled = selectItem && grade ? false : true;
    return (
      <Modal
        title={formatMessage(messages.modalTit)}
        okText={formatMessage(messages.okText)}
        cancelText={formatMessage(messages.cancle)}
        okButtonProps={{ disabled: okButtonDisabled, loading: addLoading }}
        visible={visible}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        className={styles['add-manager-modal']}
        width="376px"
        closable={false}
        centered
        destroyOnClose
        maskClosable={false}
        afterClose={this.modalClose}
      >
        <div className="content">
          <Search
            placeholder={formatMessage(messages.searchPlaceholder)}
            onSearch={value => this.onSearch(value)}
            className="search"
            maxLength={30}
            onChange={this.handleValueChange}
          />

          <div className="search-result-box">
            {/* 搜索结果展示列表 */}
            {managerList.length > 0 && (
              <div className="result">
                <List
                  grid={{ gutter: 16, column: 2 }}
                  dataSource={managerList}
                  renderItem={item => (
                    <List.Item>
                      <ManagerAvatarH
                        item={item}
                        key={item.teacherId}
                        selectItem={selectItem}
                        onHandleSelectManager={() => this.selectManager(item)}
                        type="basicConfig"
                      />
                    </List.Item>
                  )}
                />
              </div>
            )}

            {/* 年级 */}
            {(!searched || (searched && managerList.length > 0)) && (
              <div className="subjectAndGrade">
                <div className="item">
                  <div className="title">
                    {formatMessage({
                      id: 'operate.title.choose.grade',
                      defaultMessage: '选择年级',
                    })}
                    <span className="require">*</span>
                  </div>
                  <Select
                    defaultValue={grade}
                    placeholder="请选择年级"
                    style={{ width: 'calc(100% - 70px)' }}
                    onChange={this.handleGradeChange}
                  >
                    {gradList.map(tag => (
                      <Option key={tag.id} value={tag.id}>
                        {tag.gradeValue}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
            )}

            {/* 搜索不到数据 */}
            {searched && managerList.length === 0 && (
              <div className="notFound">
                <div className="icon">
                  <img src={managerIcon} alt="manager" />
                </div>
                <div className="tip">
                  <FormattedMessage
                    values={{
                      element: (
                        <span
                          style={{
                            padding: '0 5px',
                            color: '#888888',
                            fontSize: '14px',
                            fontWeight: 'bold',
                          }}
                        >
                          {formatMessage({
                            id: 'app.text.app.campus.manage',
                            defaultMessage: '教师管理',
                          })}
                        </span>
                      ),
                    }}
                    {...{
                      id: 'app.text.not.find.teahcer.tip',
                      defaultMessage: '找不到该教师，请先去{element}检查教师已绑定校区',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    );
  }
}

export default AddManagerModal;
