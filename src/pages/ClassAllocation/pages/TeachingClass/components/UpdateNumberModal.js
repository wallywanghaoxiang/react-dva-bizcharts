/**
 *
 * User: tina.zhang
 * Explain: 批量更新学号弹框组件
 *
 * */
import React, { Component } from 'react';
import { Form, Modal, Table, Input, message } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import { connect } from 'dva';
import styles from './index.less';

const messages = defineMessages({
  cancel: { id: 'app.cancel', defaultMessage: '取消' },
  save: { id: 'app.save', defaultMessage: '保存' },
  editSuccess: { id: 'app.menu.classmanage.success.toast', defaultMessage: '编辑成功！' },
  addSuccess: { id: 'app.menu.classmanage.add.success.toast', defaultMessage: '您已成功创建' },
  settingAliases: { id: 'app.menu.classmanage.settingAliases', defaultMessage: '班级别名' },
  limitedstudentClassCode: {
    id: 'app.menu.classmanage.name.length.over.limitedstudentClassCode',
    defaultMessage: '班内学号不能为空',
  },
  updateNumber: { id: 'app.menu.classmanage.updateNumber', defaultMessage: '批量更新班内学号' },
  oneTouchNumber: { id: 'app.menu.classmanage.oneTouchNumber', defaultMessage: '一键生成班内学号' },
  editFailure: { id: 'app.menu.classmanage.success.editFailure', defaultMessage: '编辑失败！' },
  unitNameIsTooNumber: {
    id: 'app.menu.classmanage.name.length.over.unitNameIsTooNumber',
    defaultMessage: '班内学号为数字，最多支持2位，如：01',
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
      console.log(values.studentClassCode.length);
      if (values.studentClassCode.length > 1) {
        handleSave({ ...record, ...values });
      } else {
        handleSave({ ...record, studentClassCode: `0${values.studentClassCode}` });
      }
    });
  };

  render() {
    const { editing } = this.state;
    const { editable, dataIndex, title, record, ...restProps } = this.props;
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
                      ref={node => {
                        this.input = node;
                      }}
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
@connect(({ clzss, loading }) => ({
  loading: loading.effects['clzss/updateTeachingStudentCode'],
  teachingStudents: clzss.teachingStudents,
}))
class UpdateNumberModal extends Component {
  constructor(props) {
    super(props);
    this.columns = [];
    const { studentList } = props;
    studentList.forEach((item, index) => {
      studentList[index].operation = '';
    });
    this.state = {
      dataSource: studentList,
      errorInfo: formatMessage({
        id: 'app.import.student.table.student.id.tip1',
        defaultMessage: '班内学号重复，请保持其唯一',
      }),
    };
  }

  onHandleCancel = () => {
    const { hideModal } = this.props;
    const { studentList } = this.props;
    studentList.forEach((item, index) => {
      studentList[index].operation = '';
    });
    this.setState({
      dataSource: studentList,
    });
    hideModal();
  };

  // 更新学生列表
  fetchNaturalClass = () => {
    const { dispatch, teachingClassId } = this.props;
    dispatch({
      type: 'clzss/getTeachingStudents',
      payload: teachingClassId,
    });
  };

  // 批量保存学号信息
  onHandleOK = () => {
    const { form, dispatch, teachingClassId } = this.props;
    const that = this;
    const arr = [];
    const { dataSource } = this.state;
    dataSource.forEach(item => {
      arr.push({
        studentId: item.studentId,
        teachingClassId,
        studentClassCode: item.studentClassCode,
      });
    });
    form.validateFields(err => {
      if (!err) {
        const { hideModal } = this.props;

        dispatch({
          type: 'clzss/updateTeachingStudentCode',
          payload: arr,
          callback: res => {
            hideModal();
            const x = typeof res === 'string' ? JSON.parse(res) : res;
            const { responseCode, data } = x;
            if (responseCode === '200') {
              that.fetchNaturalClass();
              message.success(
                formatMessage({
                  id: 'app.message.updateStudentIdSuccess',
                  defaultMessage: '更新学号成功',
                })
              );
            } else {
              const { studentList } = that.props;
              studentList.forEach((item, index) => {
                studentList[index].operation = '';
              });
              that.setState({
                dataSource: studentList,
              });
              message.warning(data);
            }
          },
        });
      }
    });
  };

  // 一键生成班内学号
  editCodeKey = () => {
    const { dataSource } = this.state;
    const newData = dataSource.map((item, index) => {
      let counts = index + 1;
      if (counts < 10) {
        counts = `0${counts}`;
      }
      console.log(counts, {
        ...item,
        studentClassCode: counts,
        operation: '',
      });
      return {
        ...item,
        studentClassCode: counts,
        operation: '',
      };
    });
    this.setState({
      dataSource: newData,
    });
  };

  handleSave = row => {
    console.log(row);
    const newData = this.state.dataSource.map(item => {
      if (row.id === item.id) {
        const re = /^[0-9]*[0-9][0-9]*$/;
        if (row.studentClassCode.length > 2) {
          return {
            ...item,
            ...row,
            operation: formatMessage({
              id: 'app.message.classManage.studentNumber.length',
              defaultMessage: '班内学号为数字，最多支持2位，如：01！',
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
      if (row.studentClassCode !== '' && row.studentClassCode === item.studentClassCode) {
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
    const { visibleModal, loading } = this.props;
    const { dataSource } = this.state;
    const re = /^[0-9]*[0-9][0-9]*$/;
    dataSource.forEach((item, index) => {
      dataSource.forEach(vo => {
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
            id: 'app.message.classManage.studentNumber.length',
            defaultMessage: '班内学号为数字，最多支持2位，如：01！',
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
        title: formatMessage({ id: 'app.menu.classmanage.classID', defaultMessage: '班内学号' }),
        dataIndex: 'studentClassCode',
        width: 60,
        editable: true,
      },
      {
        title: formatMessage({ id: 'app.menu.classmanage.studentName', defaultMessage: '姓名' }),
        width: 80,
        dataIndex: 'studentName',
        render: record => <div className={styles.studentNameInfo}>{record}</div>,
      },
      // {
      //   title: formatMessage({ id: 'app.menu.classmanage.studentGender', defaultMessage: '性别' }),
      //   width: 60,
      //   dataIndex: 'gender',
      //   render: (text, record) => (
      //     <span>
      //       {record.gender === 'MALE'
      //         ? formatMessage({ id: 'app.text.classManage.sex.male', defaultMessage: '男' })
      //         : formatMessage({ id: 'app.text.classManage.sex.female', defaultMessage: '女' })}
      //     </span>
      //   ),
      // },
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
        <span>{formatMessage(messages.updateNumber)}</span>
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
        okText={formatMessage(messages.save)}
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

export default UpdateNumberModal;
