/**
 *
 * User: tina.zhang
 * Explain: 批量更新学号弹框组件
 *
 * */
import React, { Component } from 'react';
import { Form, Modal, Table, Input, message, Tooltip } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import { connect } from 'dva';
import styles from './index.less';

const messages = defineMessages({
  cancel: { id: 'app.cancel', defaultMessage: '取消' },
  submit: { id: 'app.submit', defaultMessage: '确定' },
  editSuccess: { id: 'app.menu.classmanage.success.toast', defaultMessage: '编辑成功！' },
  addSuccess: { id: 'app.menu.classmanage.add.success.toast', defaultMessage: '您已成功创建' },
  settingAliases: { id: 'app.menu.classmanage.settingAliases', defaultMessage: '班级别名' },
  addStudentOk: { id: 'app.menu.learninggroup.addStudentOk', defaultMessage: '转入学生成功' },
  unitNameIsTooLong: {
    id: 'app.menu.classmanage.name.length.over.limited',
    defaultMessage: '班级别名不能为空',
  },
  switchTo: { id: 'app.menu.classmanage.switchTo', defaultMessage: '转入' },
  oneTouchNumber: { id: 'app.menu.classmanage.oneTouchNumber', defaultMessage: '一键生成班内学号' },
  editFailure: { id: 'app.menu.classmanage.success.editFailure', defaultMessage: '编辑失败！' },
  unitNameIsTooNumber: {
    id: 'app.menu.classmanage.name.length.over.unitNameIsTooNumber',
    defaultMessage: '班内学号为数字，最多支持2位，如：01',
  },
  limitedstudentClassCode: {
    id: 'app.menu.classmanage.name.length.over.limitedstudentClassCode',
    defaultMessage: '班内学号不能为空',
  },
  deletedStuTipTit: {
    id: 'app.deleted.student.confirm.tip.title',
    defaultMessage: '本班有同性别同姓名的学生',
  },
  deletedStuTip1: {
    id: 'app.deleted.student.confirm.tip.title1',
    defaultMessage: '选择右侧学生，会进行数据合并，且',
  },
  deletedStuTip2: { id: 'app.deleted.student.confirm.tip.title2', defaultMessage: '不可撤销' },
  duplicateNameModalTip1: {
    id: 'app.duplicate.student.name.confirm.tip1',
    defaultMessage: '以下为本班',
  },
  duplicateNameModalTip2: {
    id: 'app.duplicate.student.name.confirm.tip2',
    defaultMessage: '同性别的重名学生',
  },
});

const FormItem = Form.Item;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

@connect(({ login }) => ({
  campusID: login.campusID,
}))
class EditableCell extends React.Component {
  state = {
    editing: false,
  };

  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus();
      }
    });
  };

  save = e => {
    const { record, handleSave } = this.props;
    this.form.validateFields((error, values) => {
      if (error && error[e.currentTarget.id]) {
        handleSave({ ...record, studentClassCode: `` });
        return;
      }
      this.toggleEdit();
      if (values.studentClassCode.length > 1) {
        handleSave({ ...record, ...values });
      } else {
        const finalData = values.studentClassCode;
        if (finalData < 10) {
          finalData = `0${values.studentClassCode}`;
        }
        handleSave({ ...record, studentClassCode: finalData });
      }
    });
  };

  render() {
    const { editing } = this.state;
    const { editable, dataIndex, record, ...restProps } = this.props;
    return (
      <td {...restProps}>
        {editable ? (
          <EditableContext.Consumer>
            {form => {
              this.form = form;
              return editing ? (
                <FormItem style={{ margin: 0 }}>
                  {form.getFieldDecorator(dataIndex, {
                    rules: [
                      {
                        required: true,
                        message: ``,
                      },
                    ],
                    initialValue: record[dataIndex],
                  })(
                    <Input
                      ref={node => (this.input = node)}
                      onPressEnter={this.save}
                      onBlur={this.save}
                    />
                  )}
                </FormItem>
              ) : (
                <div className="editable-cell-value-wrap" onClick={this.toggleEdit}>
                  {restProps.children}
                </div>
              );
            }}
          </EditableContext.Consumer>
        ) : (
          restProps.children
        )}
      </td>
    );
  }
}

@Form.create()
@connect(({ clzss }) => ({
  adminStudents: clzss.adminStudents,
  naturalClassStudents: clzss.naturalClassStudents,
}))
class SwithTo extends Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        title: formatMessage({
          id: 'app.import.student.table.header.name',
          defaultMessage: '姓名',
        }),
        dataIndex: 'studentName',
        width: 80,
      },
      {
        title: formatMessage({
          id: 'app.import.student.table.header.student.id',
          defaultMessage: '班内学号',
        }),
        dataIndex: 'studentClassCode',
        width: 80,
        editable: true,
      },
      {
        title: '',
        dataIndex: 'operation',
        render: (text, record) => <span className={styles.warninginfo}>{record.operation}</span>,
      },
    ];
    const { studentList } = props;
    studentList.forEach((item, index) => {
      studentList[index].operation = '';
    });
    this.recoveryData = []; // 存储恢复的数据
    this.state = {
      loading: false,
      dataSource: studentList,
      errorInfo: formatMessage({
        id: 'app.import.student.table.student.id.tip1',
        defaultMessage: '班内学号重复，请保持其唯一',
      }),
    };
  }

  onHandleCancel = () => {
    const { hideModal } = this.props;
    hideModal();
  };

  // 修改成后回调重新列表
  getNaturalClass = () => {
    const { dispatch, id } = this.props;
    const params = {
      id,
    };
    dispatch({
      type: 'clzss/fetchNaturalClass',
      payload: params,
    });
  };

  addClassMoveStudents = () => {
    const { form, dispatch, id } = this.props;
    const { dataSource } = this.state;
    const that = this;
    const arr = [];
    dataSource.forEach(item => {
      arr.push({
        naturalClassId: id,
        studentId: item.studentId,
        studentClassCode: item.studentClassCode,
      });
    });
    form.validateFields(err => {
      if (!err) {
        const { hideModal } = this.props;
        hideModal();
        dispatch({
          type: 'clzss/addClassMoveStudents',
          payload: arr,
          callback: res => {
            const x = typeof res === 'string' ? JSON.parse(res) : res;
            const { responseCode, data } = x;
            if (responseCode === '200') {
              that.getNaturalClass();
              message.success(
                formatMessage({
                  id: 'app.message.transferredToStudentSuccess',
                  defaultMessage: '调入学生成功',
                })
              );
            }
          },
        });
      }
    });
  };

  // 批量转入
  onHandleOK = () => {
    const {
      dispatch,
      id,
      adminStudents,
      nearFutureDeleteModalVisible,
      sameNameAndGenderModalVisible,
    } = this.props;
    const { dataSource } = this.state;
    const formerStudents = [];
    const newStudents = [];
    const campusId = localStorage.getItem('campusId');
    let paramsObj = {
      studentList: [],
      campusId: '',
      naturalClassId: '',
      name: '',
      gender: '',
      studentClassCode: '',
      isTransient: '',
    };

    if (dataSource && dataSource.length > 0) {
      dataSource.forEach(item => {
        if (adminStudents.length > 0) {
          adminStudents.forEach(student => {
            if (
              student.studentId !== item.studentId &&
              student.gender === item.gender &&
              student.studentName === item.studentName
            ) {
              newStudents.push(item);
            }
          });
          paramsObj = {
            studentList: newStudents,
            campusId,
            naturalClassId: id,
            name: item.studentName,
            gender: item.gender,
            studentClassCode: item.studentClassCode,
            isTransient: item.isTransient,
            studentId: item.studentId,
          };
          formerStudents.push(paramsObj);
        }
      });
    }
    console.log(dataSource);
    if (formerStudents.length > 0) {
      dispatch({
        type: 'clzss/postDuplicateStudents',
        payload: formerStudents,
        callback: res => {
          if (res.responseCode === '200') {
            const resData = res.data;
            const { restoreName, duplicateName } = resData;
            // 最近删除
            console.log(restoreName);

            if (duplicateName.length > 0) {
              console.log(restoreName);
              sameNameAndGenderModalVisible(true, duplicateName, restoreName);
              const { hideModal } = this.props;
              hideModal();
            } else if (restoreName.length > 0 && duplicateName.length === 0) {
              nearFutureDeleteModalVisible(true, restoreName);
              const { hideModal } = this.props;
              hideModal();
            } else {
              this.addClassMoveStudents();
            }
          } else {
            const mgs = res.data;
            message.warning(mgs);
          }
        },
      });
    } else {
      this.addClassMoveStudents();
    }
  };

  // 一键生成班内学号
  editCodeKey = () => {
    const { dataSource } = this.state;
    const { adminStudents, saveCheckedList } = this.props;
    const studentCode = [];
    let checkList = [];
    for (let i = 1; i < 100; i++) {
      if (i < 10) {
        studentCode.push(`0${i}`);
      } else {
        studentCode.push(i);
      }
    }

    adminStudents.forEach(vo => {
      studentCode.forEach((v2, index) => {
        if (parseInt(vo.studentClassCode) === parseInt(v2) && vo.isMark !== 'Y') {
          studentCode.splice(index, 1);
        }
      });
    });
    if (studentCode.length < dataSource.length) {
      message.warning(
        formatMessage({
          id: 'app.text.classManage.switch.to.more',
          defaultMessage:
            '调入学生将导致班内学生数量超过100人，请到 班级 - 行政班 - 班务管理 中将要异动出去的学生标记调出。',
        })
      );
    }
    const newData = dataSource.map((item, index) => {
      return {
        ...item,
        studentClassCode: studentCode[index],
        operation: '',
      };
    });
    checkList = dataSource.map((item, index) => {
      return {
        ...item,
        studentClassCode: studentCode[index],
      };
    });
    this.setState({
      dataSource: newData,
    });

    console.log(this.props);
    this.props.saveCheckedList(checkList);
  };

  handleSave = row => {
    const newData = this.state.dataSource.map(item => {
      if (row.studentId === item.studentId) {
        const re = /^[0-9]*[1-9][0-9]*$/;
        if (row.studentClassCode.length > 2) {
          return {
            ...item,
            ...row,
            operation: formatMessage({
              id: 'app.text.classManage.studentCode',
              defaultMessage: '请输入两位数字的班内学号！',
            }),
          };
        }
        if (row.studentClassCode === '') {
          return {
            ...item,
            ...row,
            operation: formatMessage(messages.limitedstudentClassCode),
          };
        }
        if (!re.test(row.studentClassCode) || row.studentClassCode === '00') {
          return {
            ...item,
            ...row,
            operation: formatMessage(messages.unitNameIsTooNumber),
          };
        }
        return {
          ...item,
          ...row,
          operation: '',
        };
      }
      if (row.studentClassCode === item.studentClassCode && item.isMark !== 'Y') {
        return {
          ...item,
          operation: formatMessage({
            id: 'app.import.student.table.student.id.tip1',
            defaultMessage: '班内学号重复，请保持其唯一',
          }),
        };
      }
      return {
        ...item,
        operation: '',
      };

      return item;
    });
    this.setState({
      dataSource: newData,
    });
  };

  render() {
    const { visibleModal, adminStudents } = this.props;
    const { loading, dataSource } = this.state;
    const re = /^[0-9]*[1-9][0-9]*$/;
    dataSource.forEach((item, index) => {
      dataSource.forEach(vo => {
        adminStudents.forEach(v2 => {
          if (
            v2 &&
            (item.studentId !== v2.studentId &&
              item.studentClassCode !== '' &&
              item.studentClassCode === v2.studentClassCode &&
              v2.isMark !== 'Y')
          ) {
            dataSource[index].operation = formatMessage({
              id: 'app.import.student.table.student.id.tip1',
              defaultMessage: '班内学号重复，请保持其唯一',
            });
          }
        });
        if (
          item.studentId !== vo.studentId &&
          item.studentClassCode !== '' &&
          item.studentClassCode === vo.studentClassCode
        ) {
          dataSource[index].operation = formatMessage({
            id: 'app.import.student.table.student.id.tip1',
            defaultMessage: '班内学号重复，请保持其唯一',
          });
        }
        if (item.studentClassCode === '') {
          dataSource[index].operation = formatMessage(messages.limitedstudentClassCode);
        } else if (!re.test(item.studentClassCode) || item.studentClassCode === '00') {
          dataSource[index].operation = formatMessage(messages.unitNameIsTooNumber);
        } else if (item.studentClassCode.length > 2) {
          dataSource[index].operation = formatMessage({
            id: 'app.text.classManage.studentCode',
            defaultMessage: '请输入两位数字的班内学号！',
          });
        }
      });
    });
    const len = dataSource.filter(item => item.operation != '').length;
    const warningTips = len ? (
      <span style={{ color: '#FF6E4A', fontSize: '13px' }}>
        <i
          className="iconfont icon-info-circle"
          style={{ fontSize: '15px', paddingRight: '5px' }}
        />
        {formatMessage({ id: 'app.text.classManage.check.error', defaultMessage: '检测到' })}
        {len}
        {formatMessage({
          id: 'app.text.classManage.check.error.count',
          defaultMessage: '处错误信息',
        })}
      </span>
    ) : (
      ''
    );
    this.columns = [
      {
        title: formatMessage({
          id: 'app.import.student.table.header.name',
          defaultMessage: '姓名',
        }),
        dataIndex: 'studentName',
        width: 80,
        render: record => (
          <Tooltip title={record} className={styles.studentNameInfo}>
            {record}
          </Tooltip>
        ),
      },
      {
        title: formatMessage({
          id: 'app.import.student.table.header.student.id',
          defaultMessage: '班内学号',
        }),
        dataIndex: 'studentClassCode',
        width: 80,
        editable: true,
      },
      {
        title: warningTips,
        dataIndex: 'operation',
        render: (text, record) => <span className={styles.warninginfo}>{record.operation}</span>,
      },
    ];

    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });

    // 显示头部信息
    const ShowTitle = () => (
      <div>
        <span>{formatMessage(messages.switchTo)}</span>
        <span onClick={this.editCodeKey}>{formatMessage(messages.oneTouchNumber)}</span>
      </div>
    );

    return (
      <Modal
        visible={visibleModal}
        centered
        title={<ShowTitle />}
        closable={false}
        confirmLoading={loading}
        width={563}
        maskClosable={false}
        destroyOnClose
        cancelText={formatMessage(messages.cancel)}
        okText={formatMessage(messages.submit)}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className={styles.updateNumberModal}
        okButtonProps={{ disabled: dataSource.filter(item => item.operation !== '').length > 0 }}
      >
        <div>
          <Table
            components={components}
            rowClassName={() => 'editable-row'}
            bordered
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            scroll={{ y: 300 }}
          />
        </div>
      </Modal>
    );
  }
}

export default SwithTo;
