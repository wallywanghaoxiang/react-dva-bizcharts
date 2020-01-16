/**
 *
 * User: tina.zhang
 * Explain: 批量更新学号弹框组件
 *
 * */
import React, { Component } from 'react';
import { Form, Modal, Table, Input, message, List } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import { connect } from 'dva';
import StudentTip from '@/components/StudentTip';
import styles from './index.less';

const messages = defineMessages({
  cancel: { id: 'app.cancel', defaultMessage: '取消' },
  submit: { id: 'app.submit', defaultMessage: '确定' },
  know: { id: 'app.know', defaultMessage: '我知道了' },
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
    console.log(record);
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
                <div
                  className="editable-cell-value-wrap"
                  style={{ paddingRight: 24 }}
                  onClick={this.toggleEdit}
                >
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
  loading: loading.effects['clzss/addTeachingStudents'],
  teachingStudents: clzss.teachingStudents,
}))
class SwithTo extends Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        title: formatMessage({ id: 'app.menu.classmanage.studentName', defaultMessage: '姓名' }),
        dataIndex: 'studentName',
        width: 80,
      },
      {
        title: formatMessage({ id: 'app.menu.classmanage.classID', defaultMessage: '班内学号' }),
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
    this.state = {
      dataSource: studentList,
      errorInfo: formatMessage({
        id: 'app.import.student.table.student.id.tip1',
        defaultMessage: '班内学号重复，请保持其唯一',
      }),
      ruleList: [],
      ruleVisible: false,
    };
  }

  onHandleCancel = () => {
    const { hideModal } = this.props;
    hideModal();
    this.setState({
      ruleVisible: false,
    });
  };

  // 更新学生列表
  fetchNaturalClass = () => {
    const { dispatch, id } = this.props;
    dispatch({
      type: 'clzss/getTeachingStudents',
      payload: id,
    });
  };

  // 批量转入
  onHandleOK = () => {
    const { form, dispatch, id } = this.props;
    const that = this;
    const arr = [];
    const { dataSource } = this.state;
    console.log(dataSource);
    dataSource.forEach(item => {
      arr.push({
        studentId: item.studentId,
        teachingClassId: id,
        studentClassCode: item.studentClassCode,
        naturalClassId: item.naturalClassId,
        isGradeSwap: item.isGradeSwap,
      });
    });
    form.validateFields(err => {
      if (!err) {
        const { hideModal } = this.props;
        dispatch({
          type: 'clzss/addTeachingStudents',
          payload: arr,
          callback: res => {
            const x = typeof res === 'string' ? JSON.parse(res) : res;
            const { responseCode, data } = x;
            if (responseCode === '200') {
              if (data.length > 0) {
                this.setState({
                  ruleList: data,
                  ruleVisible: true,
                });
              } else {
                hideModal();
                that.fetchNaturalClass();
                message.success(
                  formatMessage({
                    id: 'app.message.transferredToStudentSuccess',
                    defaultMessage: '调入学生成功',
                  })
                );
              }
            } else {
              hideModal();
              console.log(data);
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
    const { teachingStudents } = this.props;
    let studentCode = [];
    for (let i = 1; i < 100; i++) {
      if (i < 10) {
        studentCode.push(`0${i}`);
      } else {
        studentCode.push(i);
      }
    }

    teachingStudents.forEach(vo => {
      studentCode.forEach((v2, index) => {
        if (parseInt(vo.studentClassCode) === parseInt(v2)) {
          console.log(vo.studentClassCode, v2);
          studentCode.splice(index, 1);
        }
      });
    });
    console.log(studentCode);
    if (studentCode.length < dataSource.length) {
      message.warning(
        formatMessage({
          id: 'app.message.classMange.tips.import',
          defaultMessage:
            '调入学生将导致班内学生数超过100人，请先到 班级管理 - 教学班- 当前班级的班务管理中 将要异动出的学生删除。',
        })
      );
    }
    const newData = dataSource.map((item, index) => {
      let counts = index + 1;
      if (counts < 10) {
        counts = `0${counts}`;
      }
      console.log(counts, {
        ...item,
        studentClassCode: studentCode[index],
        operation: '',
      });
      return {
        ...item,
        studentClassCode: studentCode[index],
        operation: '',
      };
    });
    this.setState({
      dataSource: newData,
    });
  };

  handleSave = row => {
    const newData = this.state.dataSource.map(item => {
      if (row.studentId === item.studentId) {
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
      if (row.studentClassCode === item.studentClassCode) {
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
    const { visibleModal, teachingStudents, loading } = this.props;
    const { dataSource, ruleVisible, ruleList } = this.state;
    const re = /^[0-9]*[0-9][0-9]*$/;
    dataSource.forEach((item, index) => {
      teachingStudents.forEach(v2 => {
        if (
          item.studentId !== v2.studentId &&
          item.studentClassCode !== '' &&
          item.studentClassCode === v2.studentClassCode
        ) {
          dataSource[index].operation = formatMessage({
            id: 'app.import.student.table.student.id.tip1',
            defaultMessage: '班内学号重复，请保持其唯一',
          });
        }
      });
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
        title: formatMessage({ id: 'app.menu.classmanage.teacherName', defaultMessage: '姓名' }),
        dataIndex: 'studentName',
        width: 80,
        render: record => <div className={styles.studentNameInfo}>{record}</div>,
      },
      {
        title: formatMessage({ id: 'app.menu.classmanage.classID', defaultMessage: '班内学号' }),
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

    return !ruleVisible ? (
      <Modal
        visible={visibleModal || !ruleVisible}
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
    ) : (
      <Modal
        visible={ruleVisible}
        centered
        title=""
        closable={false}
        width={563}
        maskClosable={false}
        destroyOnClose
        okText={formatMessage(messages.know)}
        onOk={this.onHandleCancel}
        className={styles.itemModalRule}
      >
        <div className={styles.students}>
          <p className={styles.rules}>
            {' '}
            <i className="iconfont icon-warning" />
            {formatMessage({
              id: 'app.text.classManage.NoImport',
              defaultMessage: '以下学生不符合异动规则，无法调入本班',
            })}
          </p>
          <List
            grid={{ gutter: 10, xs: 3, sm: 3, md: 3, lg: 3, xl: 3, xxl: 3 }}
            className={styles.ruleNo}
            dataSource={ruleList || []}
            renderItem={item => (
              <List.Item>
                <StudentTip item={item} isMark />
              </List.Item>
            )}
          />
        </div>
      </Modal>
    );
  }
}

export default SwithTo;
