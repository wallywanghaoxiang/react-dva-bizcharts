import React, { Component } from 'react';
import './index.less';
import { Col, Table, Button, Input, Form, Modal, message, List } from 'antd';
import { connect } from 'dva';
import Link from 'umi/link';
import excel from '@/utils/excel';
import { formatMessage, defineMessages, FormattedMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import excelStudentPic from '@/assets/teacher/excel_student_pic1.png';
import loadingGif from '@/assets/loading.gif';
import StudentAvatar from '../components/StudentAvatar';
// import NearFutureDeleteModal from '../components/NearFutureDeleteModal';
import ImportDeleteModal from '../components/ImportDeleteModal';

import { isNumber, Trim } from '@/utils/utils';
import router from 'umi/router';

const messages = defineMessages({
  classmanage: { id: 'app.menu.classallocation.classmanage', defaultMessage: '班级' },
  adminclass: { id: 'app.menu.classallocation.adminclass', defaultMessage: '行政班' },
  classwork: { id: 'app.menu.classallocation.classwork', defaultMessage: '学生导入' },
  studentID: { id: 'app.import.student.table.header.student.id', defaultMessage: '班内学号' },
  name: { id: 'app.import.student.table.header.name', defaultMessage: '姓名' },
  gender: { id: 'app.import.student.table.header.gender', defaultMessage: '性别' },
  borrowing: { id: 'app.import.student.table.header.borrowing', defaultMessage: '是否借读' },
  studentIDTip: {
    id: 'app.import.student.table.student.id.tip',
    defaultMessage: '班内学号不能为空。支持最多2位数字，如：01',
  },
  studentIDTip1: {
    id: 'app.import.student.table.student.id.tip1',
    defaultMessage: '班内学号重复，请保持其唯一',
  },
  studentIDTip2: {
    id: 'app.import.student.table.student.id.tip2',
    defaultMessage: '班内学号支持最多2位数字，如：01',
  },
  errorNum: {
    id: 'app.import.student.table.header.err.number',
    defaultMessage: '检测到{number}处错误信息',
  },
  studentNameTip: {
    id: 'app.import.student.table.student.name.tip',
    defaultMessage: '姓名不能为空',
  },
  studentNameTip1: {
    id: 'app.import.student.table.student.name.tip1',
    defaultMessage: '姓名不能超过20个字',
  },
  genderTip: {
    id: 'app.import.student.table.student.gender.tip',
    defaultMessage: '性别不能为空，可输入 男 或 女',
  },
  genderTip1: {
    id: 'app.import.student.table.student.gender.tip1',
    defaultMessage: '性别字段输入错误，可输入 男 或 女',
  },
  borrowingTip: {
    id: 'app.import.student.table.student.borrowing.tip',
    defaultMessage: '是否借读不可为空，可输入 是 或 否',
  },
  borrowingTip1: {
    id: 'app.import.student.table.student.borrowing.tip1',
    defaultMessage: '是否借读输入错误，可输入 是 或 否',
  },
  duplicateWarn: {
    id: 'app.import.student.table.student.name.gender.tip',
    defaultMessage: '已有同性别的重名学生，请检查输入',
  },

  teacherMobileTip: {
    id: 'app.import.student.table.student.mobile.tip',
    defaultMessage: '请输入教师手机号',
  },
  teacherMobileTip1: {
    id: 'app.import.student.table.student.mobile.tip1',
    defaultMessage: '手机号导入格式不正确',
  },
  teacherMobileTip2: {
    id: 'app.import.student.table.student.mobile.tip2',
    defaultMessage: '此处手机号有重复，请检查是否有录入错误',
  },
  studentNameTip2: {
    id: 'app.import.student.table.student.name.tip2',
    defaultMessage: '此处有重名，请检查是否有录入错误',
  },
  teacherMobileTip3: {
    id: 'app.import.student.table.student.mobile.tip3',
    defaultMessage: '手机号已存在，继续导入将覆盖当前手机号、姓名',
  },
  importTip: {
    id: 'app.import.student.header.tip',
    defaultMessage: '请在表格中输入学生信息，您也可以直接将Excel中学生信息复制粘贴到表格中',
  },
  loadingTip: { id: 'app.import.student.loading.tip', defaultMessage: '正在导入…请稍候' },
  cancel: { id: 'app.cancel', defaultMessage: '取消' },
  confirm: { id: 'app.confirm', defaultMessage: '确定' },
  importBtnTit: { id: 'app.import.student.import.btn.title', defaultMessage: '导入' },
  importBtnTit1: { id: 'app.import.student.import.btn.title1', defaultMessage: '正在导入' },
  guide: { id: 'app.import.guide.title', defaultMessage: '操作引导' },
  downTemp: { id: 'app.import.guide.down.template', defaultMessage: '下载模板' },
  guideStep2: {
    id: 'app.import.student.guide.step2.title',
    defaultMessage: '打开Excel，选择需要上传的学生班内考号、姓名等信息并复制',
  },
  guideStep3: {
    id: 'app.import.student.guide.step3.title',
    defaultMessage: '点击左侧表格按Ctrl+V(粘贴)，填入学生信息',
  },
  guideStep4: { id: 'app.import.guide.step4.title', defaultMessage: '点击【导入】按钮' },
  backTip: { id: 'app.import.back.tip', defaultMessage: '有未提交的信息确认要返回吗？' },
  importSuccess: {
    id: 'app.import.student.success',
    defaultMessage: '导入学生（{number}人）成功！',
  },
  continueImport: { id: 'app.import.continue.btn.title', defaultMessage: '继续导入' },
  backList: { id: 'app.import.back.list', defaultMessage: '返回列表' },

  deletedStuTipTit: {
    id: 'app.deleted.student.confirm.tip.title',
    defaultMessage: '发现您在异动期内删除过同性别同名的学生',
  },
  deletedStuTip1: {
    id: 'app.deleted.student.confirm.tip.title1',
    defaultMessage: '选择右侧学生，会进行数据恢复，且',
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
  duplicateNameModalTip3: {
    id: 'app.duplicate.student.name.confirm.tip3',
    defaultMessage: '，是否忽略提醒，并继续导入？',
  },
  duplicateNameModalConfirmBtn: {
    id: 'app.duplicate.student.name.confirm..btn.title',
    defaultMessage: '忽略提醒，并继续',
  },
});

const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: '',
    };
  }

  // save = () => {
  //   const { record, handleSave } = this.props;
  //   this.form.validateFields((error, values) => {
  //     if (error) {
  //       return;
  //     }
  //     handleSave({ ...record, ...values });
  //   });
  // }

  handleInputChange = e => {
    // console.log(e);
    this.setState({
      inputValue: e.target.value,
    });
    const { value } = e.target;
    const { handleInput } = this.props;
    const td = e.target.parentNode;
    const { rowIndex } = td.parentNode;
    const { cellIndex } = td;
    if (!value) {
      handleInput(rowIndex, cellIndex, value);
    }
  };

  handleInputBlur = e => {
    const { value } = e.target;
    const td = e.target.parentNode;
    const { rowIndex } = td.parentNode;
    const { cellIndex } = td;
    // console.log(rowIndex,cellIndex);
    const { handleInput } = this.props;
    if (value) {
      handleInput(rowIndex, cellIndex, value);
      this.setState({
        inputValue: '',
      });
    }
  };

  initInput(record, dataIndex) {
    const { inputValue } = this.state;
    if (dataIndex && dataIndex === 'studentID') {
      // 学号
      return (
        <Input
          value={inputValue && inputValue !== '' ? inputValue : record[dataIndex]}
          onChange={this.handleInputChange}
          onBlur={this.handleInputBlur}
          maxLength={2}
        />
      );
    }
    if (dataIndex && dataIndex === 'name') {
      // 姓名
      return (
        <Input
          value={inputValue && inputValue !== '' ? inputValue : record[dataIndex]}
          onChange={this.handleInputChange}
          onBlur={this.handleInputBlur}
          maxLength={20}
        />
      );
    }

    if (dataIndex && dataIndex === 'borrowing') {
      // 是否借读
      return (
        <Input
          value={inputValue && inputValue !== '' ? inputValue : record[dataIndex]}
          onChange={this.handleInputChange}
          onBlur={this.handleInputBlur}
          maxLength={1}
        />
      );
    }
  }

  render() {
    const {
      editable,
      dataIndex,
      title,
      record,
      index,
      handleSave,
      handleInput,
      ...restProps
    } = this.props;

    const { inputValue } = this.state;
    // console.log(inputValue);
    // console.log(record,dataIndex);

    return (
      <td
        ref={node => {
          this.cell = node;
        }}
        {...restProps}
      >
        {editable ? this.initInput(record, dataIndex) : restProps.children}
      </td>
    );
  }
}

/*
    str = str.replace(/[ | ]*\n/g,'\n'); //去除行尾空白
    str=str.replace(/^[\s　]+|[\s　]+$/g, "");//去掉全角半角空格
 */
class ImportTeachersComponent extends Component {
  constructor(props) {
    super(props);

    this.errNum = 0; // 错误信息数量
    this.recoveryData = []; // 要恢复的数据
    this.naturalClassId = props.match.params.naturalClassId;
    this.columns = () => {
      return [
        {
          title: formatMessage(messages.studentID),
          dataIndex: 'studentID',
          key: 'studentID',
          editable: true,
          width: '15%',
        },
        {
          title: formatMessage(messages.name),
          dataIndex: 'name',
          key: 'name',
          editable: true,
          width: '20%',
        },

        {
          title: formatMessage(messages.borrowing),
          dataIndex: 'borrowing',
          key: 'borrowing',
          editable: true,
          width: '15%',
        },
        {
          title:
            this.errNum > 0 ? (
              <span style={{ color: '#FF6E4A', fontSize: '13px' }}>
                <i
                  className="iconfont icon-info-circle"
                  style={{ fontSize: '15px', paddingRight: '5px' }}
                />
                <FormattedMessage values={{ number: this.errNum }} {...messages.errorNum} />
              </span>
            ) : (
              ''
            ),
          dataIndex: 'error',
          key: 'error',
          render: (text, record) => {
            // console.log(text,record);
            return (
              <p className="err" style={{ color: text ? '#FF6E4A' : '#FFB400' }}>
                {text || record.warn}
              </p>
            );
          },
        },
      ];
    };

    this.state = {
      modalVisable: false, // 取消弹窗
      nearDeleteModal: false,
      restoreName: [],
      importSuccessVisable: false, //导入成功
      importBtnDisabled: true,
      loading: false,
      selectItem: null,
      tableTitle: [
        {
          title: formatMessage(messages.studentID),
          key: 'studentClassCode',
        },
        {
          title: formatMessage(messages.name),
          key: 'name',
        },
        {
          title: formatMessage(messages.gender),
          key: 'gender',
        },
        {
          title: formatMessage(messages.borrowing),
          key: 'isTransient',
        },
      ],
      tableData: [],
      studentNumber: 0, // 导入学生数量
      curItem:
        props.location.state && props.location.state.curItem ? props.location.state.curItem : [],
      dataSource: [
        {
          error: '',
          key: 0,
          studentID: '',
          name: '',
          gender: '',
          borrowing: '',
          warn: '',
        },
      ],
    };
  }

  componentDidMount() {
    const { match, dispatch, location } = this.props;
    const curItem = location.state ? location.state.curItem : '';
    this.naturalClassId = match.params.naturalClassId;
    curItem.alias = sessionStorage.getItem('curAlias') || curItem.alias;
    curItem.className = sessionStorage.getItem('className') || curItem.className;
    dispatch({
      type: 'clzss/saveCurrentNaturalTeach',
      payload: {
        item: curItem,
      },
    });
  }

  // 输入框失去焦点保存
  // handleSave = row => {
  //   const newData = [...this.state.dataSource];
  //   const index = newData.findIndex(item => row.key === item.key);
  //   const item = newData[index];
  //   newData.splice(index, 1, {
  //     ...item,
  //     ...row,
  //   });
  //   this.setState({ dataSource: newData }, () => {
  //     this.validateData();
  //   });
  // };

  /**
   * 获取粘贴板中的内容
   */
  onHandleTablePaste = e => {
    // console.log(e.clipboardData.getData('Text'));

    if (document.all)
      // 判断IE浏览器
      window.event.returnValue = false;
    else e.preventDefault();

    // 获取粘贴板数据
    let data = null;
    const clipboardData = window.clipboardData || e.clipboardData; // IE || chrome
    // console.log(clipboardData);
    data = clipboardData.getData('Text');
    // console.log(data.replace(/\t/g, '\\t').replace(/\n/g, '\\n')); //data转码

    // 解析数据
    const ecxelData = data
      .split('\n')
      .filter(function(item) {
        // 兼容Excel行末\n，防止出现多余空行
        return item !== '';
      })
      .map(function(item) {
        return item.split('\t');
      });

    // 数据清洗
    let arrStr = JSON.stringify(ecxelData);
    arrStr = arrStr.replace(/[\\r\\n]/g, ''); // 去掉回车换行
    arrStr = arrStr.replace(/\s*/g, '');
    arrStr = arrStr.replace(/^[\s　]+|[\s　]+$/g, ''); // 去掉全角半角

    const arr = JSON.parse(arrStr);

    if (arr[0].length > 1) {
      /*
       * 多条字段数据
       */

      const originData = this.state.dataSource;
      var new_Arr = new Array();
      arr.map((item, i) => {
        const obj = {};
        obj.error = '';
        obj.warn = '';
        item.map((item, index) => {
          // 匹配数据 根据提取数据规则 目前没做什么规则 复制的什么就是什么
          obj.key = originData.length + i + 1;
          if (index === 0) {
            obj.studentID = item;
          } else if (index === 1) {
            obj.name = item;
          } else if (index === 2) {
            obj.borrowing = item;
          }
        });
        new_Arr.push(obj);
      });

      let list;
      if (this.state.dataSource.length > 1) {
        // 有数据

        const oldArr = this.state.dataSource;
        // oldArr.shift(); // 去掉第一个空数据

        // new_Arr.unshift({
        //   error: '',
        //   key: 0,
        //   studentID: '',
        //   name: '',
        //   gender: '',
        //   borrowing: '',
        //   warn: '',
        // });

        list = [...new_Arr, ...oldArr];
        // 学号处理
        list.forEach(it => {
          if (it.studentID) {
            if (isNumber(it.studentID)) {
              if (it.studentID.length < 2) {
                it.studentID = `0${it.studentID}`;
              }
            }
          }
        });
        this.setState(
          {
            dataSource: list,
          },
          () => {
            this.validateData();
          }
        );
      } else {
        // 无数据

        list = [...this.state.dataSource, ...new_Arr];
        // 学号处理
        list.forEach(it => {
          if (it.studentID) {
            if (isNumber(it.studentID)) {
              if (it.studentID.length < 2) {
                it.studentID = `0${it.studentID}`;
              }
            }
          }
        });
        this.setState(
          {
            dataSource: list,
          },
          () => {
            this.validateData();
          }
        );
      }
    } else {
      /**
       * 单条字段复制
       */
      // 找到当前td
      const td = e.target.parentNode;
      const { rowIndex } = td.parentNode;
      const { cellIndex } = td;
      // console.log(rowIndex,cellIndex);

      // 判断是新增一条数据还是更新数据 老版本：this.state.dataSource.length < rowIndex+1 || this.state.dataSource.length == rowIndex+1
      if (rowIndex === 0) {
        console.log('新增数据');

        var originArr = this.state.dataSource;
        let obj = originArr[0];
        originArr.forEach((tag, i) => {
          if (i === 0) {
            if (cellIndex == 0) {
              obj.studentID = arr[0][0];
            } else if (cellIndex == 1) {
              obj.name = arr[0][0];
            } else if (cellIndex === 2) {
              obj.borrowing = arr[0][0];
            }
          }
        });

        // 学号处理
        originArr.forEach(it => {
          if (it.studentID) {
            if (isNumber(it.studentID)) {
              if (it.studentID.length < 2) {
                it.studentID = `0${it.studentID}`;
              }
            }
          }
        });

        this.setState(
          {
            dataSource: originArr,
          },
          () => {
            this.validateData();
          }
        );
      } else {
        console.log('更新数据---------');

        // console.log(arr[0][0]);

        const originArr = this.state.dataSource;
        originArr.forEach((item, index) => {
          // console.log(item,index);

          if (index == rowIndex) {
            // 找到对应的数据更新对象属性值
            if (cellIndex == 0) {
              item.studentID = arr[0][0];
            } else if (cellIndex == 1) {
              item.name = arr[0][0];
            } else if (cellIndex === 2) {
              item.borrowing = arr[0][0];
            }
          }
        });

        // 学号处理
        originArr.forEach(it => {
          if (it.studentID) {
            if (isNumber(it.studentID)) {
              if (it.studentID.length < 2) {
                it.studentID = `0${it.studentID}`;
              }
            }
          }
        });

        this.setState(
          {
            dataSource: JSON.parse(JSON.stringify(originArr)),
          },
          () => {
            this.validateData();
          }
        );
      }
    }
  };

  // 下载模板方法
  downTempMethod = () => {
    const { tableData } = this.state;
    const stuId = formatMessage(messages.studentID);
    const name = formatMessage(messages.name);
    const borrowing = formatMessage(messages.borrowing);
    const params = {
      title: [stuId, name, borrowing],
      key: ['studentClassCode', 'name', 'isTransient'],
      data: tableData,
      autoWidth: true,
      filename: formatMessage(messages.classwork),
    };
    excel.export_array_to_excel(params);
  };

  // 数据校验
  validateData() {
    const originArr = JSON.parse(JSON.stringify(this.state.dataSource));
    originArr.forEach(obj => {
      obj.error = '';
      obj.warn = '';
    });

    // 去重处理 TODO 去重复
    const strArr = [];
    originArr.map(it => {
      // 处理空白数据
      if (it.studentID || it.name || it.gender || it.borrowing) {
        const obj = {
          studentID: it.studentID,
          name: it.name,
          gender: it.gender,
          borrowing: it.borrowing,
        };
        const itStr = JSON.stringify(obj);
        strArr.push(itStr);
      }
    });

    const uniqueArr = new Set(strArr);

    const objArr = Array.from(uniqueArr);

    const arr = [];
    objArr.map((i, n) => {
      const obj = {
        studentID: JSON.parse(i).studentID,
        name: JSON.parse(i).name,
        gender: JSON.parse(i).gender,
        borrowing: JSON.parse(i).borrowing,
        key: n + 1,
        error: '',
        warn: '',
      };

      arr.push(obj);
    });

    const new_arr = arr;

    const newObject = new_arr.reduce(
      (total, currentValue, currentIndex, arr) => {
        // 1. 必填验证
        const tag = currentValue;
        if (!tag.studentID) {
          tag.error = formatMessage(messages.studentIDTip);
        } else if (tag.studentID.length > 2) {
          tag.error = formatMessage(messages.studentIDTip2);
        } else if (!isNumber(tag.studentID)) {
          tag.error = formatMessage(messages.studentIDTip2);
        } else if (tag.studentID == '00') {
          tag.error = formatMessage(messages.studentIDTip2);
        } else if (!tag.name || Trim(tag.name, 'g') === '') {
          tag.error = formatMessage(messages.studentNameTip);
        } else if (tag.name.length > 20) {
          tag.error = formatMessage(messages.studentNameTip1);
        } else if (!tag.borrowing) {
          tag.error = formatMessage(messages.borrowingTip);
        } else if (
          tag.borrowing !== '是' &&
          tag.borrowing !== '否' &&
          tag.borrowing !== 'yes' &&
          tag.borrowing !== 'no'
        ) {
          tag.error = formatMessage(messages.borrowingTip1);
        }

        const { studentID } = currentValue;
        const oldStudentID = total.studentID[studentID] || [];
        total.studentID[studentID] = [...oldStudentID, currentValue];

        const oldName = total.name[currentValue.name] || [];
        total.name[currentValue.name] = [...oldName, currentValue];

        // const oldGender = total.gender[currentValue.gender] || [];
        // total.gender[currentValue.gender] = [...oldGender, currentValue];

        const oldBorrowing = total.borrowing[currentValue.borrowing] || [];
        total.borrowing[currentValue.borrowing] = [...oldBorrowing, currentValue];

        return total;
      },
      {
        studentID: {},
        name: {},
        borrowing: {},
      }
    );

    // 2.检测是否有重复

    // 学号
    const studentIDObj = newObject.studentID;
    Object.keys(studentIDObj).forEach(it => {
      const value = studentIDObj[it];
      if (value.length > 1) {
        value.forEach(tag => {
          if (tag.error === '') {
            tag.error = formatMessage(messages.studentIDTip1);
          }
        });
      }
    });

    const nameObj = newObject.name;

    // 姓名
    Object.keys(nameObj).forEach(it => {
      const value = nameObj[it];
      if (value.length > 1) {
        value.forEach(tag => (tag.warn = formatMessage(messages.studentNameTip2)));

        // 重名重性别
        const aaa = value.reduce(
          (total, currentValue, currentIndex, arr) => {
            const oldGender = total.gender[currentValue.gender] || [];
            total.gender[currentValue.gender] = [...oldGender, currentValue];
            return total;
          },
          {
            gender: {},
          }
        );

        const genderObj = aaa.gender;
        Object.keys(genderObj).forEach(it1 => {
          const value = genderObj[it1];
          if (value.length > 1) {
            value.forEach(tag => (tag.warn = formatMessage(messages.duplicateWarn)));
          }
        });
      }
    });

    // let hasErr = false;
    if (new_arr.length > 0) {
      let hasErr = false;
      for (let i = 0; i < new_arr.length; i++) {
        const obj = new_arr[i];
        if (obj.error === '') {
          hasErr = false;
        } else {
          hasErr = true;
          break;
        }
      }

      // 新增一条数据
      // const obj = {
      //   error: '',
      //   key: 0,
      //   studentID: '',
      //   name: '',
      //   gender: '',
      //   borrowing: '',
      //   warn: '',
      // };
      // new_arr.unshift(obj);

      if (hasErr) {
        // 统计错误信息数量
        let errNum = 0;
        new_arr.map(item => {
          if (item.error !== '') {
            errNum++;
          }
        });
        this.errNum = errNum;
        this.setState({
          dataSource: new_arr,
          importBtnDisabled: true,
        });
      } else {
        // 3.前段验证没错误
        this.errNum = 0;
        new_arr.unshift({
          error: '',
          key: 0,
          studentID: '',
          name: '',
          gender: '',
          borrowing: '',
          warn: '',
        });
        this.setState(
          {
            dataSource: new_arr,
            importBtnDisabled: false,
          },
          () => {
            this.checkDuplicate();
          }
        );
      }
    } else {
      this.setState({
        importBtnDisabled: true,
      });
    }
  }

  // 后端检测同学号的学生
  checkDuplicate = () => {
    const { dispatch } = this.props;
    // 提交的数据
    const new_arr = JSON.parse(JSON.stringify(this.state.dataSource));
    new_arr.shift();
    const studentList = new_arr.map(item => {
      return this.initStudentOBJ(item);
    });
    const students = studentList;
    dispatch({
      type: 'clzss/postDuplicateStudents',
      payload: students,
      callback: res => {
        if (res.responseCode === '200') {
          // 重学号的学生
          const data_duplicateId = res.data.duplicateId;
          data_duplicateId.forEach(it => {
            new_arr.forEach(tag => {
              if (it.studentClassCode === tag.studentID) {
                tag.error = formatMessage(messages.studentIDTip1);
              }
            });
          });

          let errNum = 0;
          new_arr.map(item => {
            if (item.error !== '') {
              errNum++;
            }
          });
          this.errNum = errNum;
          if (errNum > 0) {
            this.setState({
              dataSource: new_arr,
              importBtnDisabled: true,
            });
          } else {
            new_arr.unshift({
              error: '',
              key: 0,
              studentID: '',
              name: '',
              gender: '',
              borrowing: '',
              warn: '',
            });
            this.setState({
              dataSource: new_arr,
              importBtnDisabled: false,
            });
          }
        }
      },
    });
  };

  // 后端验证数据是否重复
  checkData = () => {
    const { dispatch } = this.props;
    // 提交的数据
    const new_arr = JSON.parse(JSON.stringify(this.state.dataSource));
    new_arr.shift();
    console.log('前段验证没错误，开始后端验证');
    const studentList = new_arr.map(item => {
      return this.initStudentOBJ(item);
    });
    const students = studentList;
    dispatch({
      type: 'clzss/postDuplicateStudents',
      payload: students,
      callback: res => {
        // console.log(res);
        if (res.responseCode == '200') {
          const resData = res.data;

          const obj = {
            error: '',
            key: 0,
            studentID: '',
            name: '',
            gender: '',
            borrowing: '',
            warn: '',
          };
          new_arr.unshift(obj);

          const { duplicateName, restoreName } = resData;
          // 重名重性别
          if (duplicateName.length > 0) {
            // 重名重性别提示确认框
            let duplicateStudent = [];
            duplicateName.forEach(el => {
              duplicateStudent = duplicateStudent.concat(el.studentList);
            });
            // 去重
            let uniqArray = [];
            duplicateStudent.forEach((it, idx) => {
              const duplicateObj = uniqArray.find(
                tag => tag.studentClassCode === it.studentClassCode
              );
              if (!duplicateObj) {
                uniqArray.push(it);
              }
            });
            Modal.confirm({
              content: (
                <div className="cont">
                  <div
                    style={{
                      display: 'flex',
                      padding: '10px 10px',
                      background: '#FFF8E6',
                      borderRadius: '5px',
                      fontSize: '13px',
                    }}
                  >
                    <div>
                      <i
                        className="iconfont icon-tip"
                        style={{ color: '#FF6E4A', fontSize: '13px' }}
                      />
                    </div>
                    <div style={{ paddingLeft: '5px' }}>
                      <span>{formatMessage(messages.duplicateNameModalTip1)}</span>
                      <span className="name" style={{ color: '#FF6E4A' }}>
                        {formatMessage(messages.duplicateNameModalTip2)}
                      </span>
                      <span>{formatMessage(messages.duplicateNameModalTip3)}</span>
                    </div>
                  </div>
                  <div style={{ paddingTop: '10px' }}>
                    <List
                      grid={{ gutter: 8, column: 2 }}
                      dataSource={uniqArray}
                      renderItem={item => (
                        <List.Item>
                          <StudentAvatar item={item} />
                        </List.Item>
                      )}
                    />
                  </div>
                </div>
              ),
              okText: formatMessage(messages.duplicateNameModalConfirmBtn),
              centered: true,
              cancelText: formatMessage(messages.cancel),
              onOk: () => {
                if (restoreName.length > 0) {
                  this.showModalWarn(restoreName);
                } else {
                  this.onHandleImport();
                }
              },
            });
          } else if (restoreName.length > 0) {
            this.showModalWarn(restoreName);
          } else {
            this.errNum = 0;
            this.onHandleImport();
          }
        } else {
          const mgs = res.data;
          message.warning(mgs);
        }
      },
    });
  };

  // 近期删除学生提示弹窗
  showModalWarn = restoreName => {
    this.setState({
      restoreName,
      nearDeleteModal: true,
    });
  };

  // 导入按钮
  onHandleImport = () => {
    const arr = this.state.dataSource;
    // arr.pop();

    // 处理空白数据
    const new_arr = new Array();
    arr.map(item => {
      if (item.studentID || item.name || item.gender || item.borrowing) {
        new_arr.push(item);
      }
    });

    // 提交的数据
    const studentList = new_arr.map(item => {
      return this.initStudentOBJ(item);
    });

    const { dispatch } = this.props;

    const list = studentList;

    this.setState({
      loading: true,
      studentNumber: list.length,
    });
    dispatch({
      type: 'clzss/addClassStudents',
      payload: list,
      callback: res => {
        this.setState({
          loading: false,
        });
        if (res.responseCode == '200') {
          this.setState({
            importSuccessVisable: true,
          });
        } else {
          const mgs = res.data;
          message.warning(mgs);
        }
      },
    });
  };

  initStudentOBJ = item => {
    const campusId = localStorage.getItem('campusId');
    // 找出需要恢复的学生数据
    const recoveryObj = this.recoveryData.find(obj => obj.studentClassCode === item.studentID);
    const { naturalClassId } = this;
    const obj = {
      campusId, // 校区id
      naturalClassId, // 行政班id
      name: item.name, // 姓名
      gender: 'MALE', // 性别
      studentClassCode: item.studentID, // 班内学号
      isTransient: item.borrowing === '是' || item.borrowing === 'yes' ? 'Y' : 'N',
      id: recoveryObj ? recoveryObj.select.id : '', // 学生id
      // id: recoveryObj ? recoveryObj.select[0].id : '', // 学生id
    };
    return obj;
  };

  // input框监听
  handleInput = (rowIndex, cellIndex, value) => {
    console.log(rowIndex, cellIndex, value);
    // 老版本判断新增： this.state.dataSource.length < rowIndex+1 || this.state.dataSource.length == rowIndex+1
    if (rowIndex === 0) {
      // 新增一条数据

      var originArr = this.state.dataSource;
      originArr.forEach((tag, i) => {
        if (i === 0) {
          if (cellIndex == 0) {
            tag.studentID = value;
          } else if (cellIndex == 1) {
            tag.name = value;
          } else if (cellIndex === 2) {
            tag.borrowing = value;
          }
        }
      });

      let newList;

      newList = [...originArr];

      // 学号处理
      newList.forEach(it => {
        if (it.studentID) {
          if (isNumber(it.studentID)) {
            if (it.studentID.length < 2) {
              it.studentID = `0${it.studentID}`;
            }
          }
        }
      });

      this.setState(
        {
          dataSource: newList,
        },
        () => {
          this.validateData();
        }
      );
    } else {
      console.log('跟新');

      const originArr = this.state.dataSource;
      let allFillIn = false;
      originArr.forEach((item, index) => {
        // console.log(item,index);

        if (index == rowIndex) {
          // 找到对应的数据更新对象属性值

          if (cellIndex == 0) {
            item.studentID = value;
          } else if (cellIndex == 1) {
            item.name = value;
          } else if (cellIndex === 2) {
            item.borrowing = value;
          }

          if (item.studentID && item.name && item.borrowing) {
            allFillIn = true;
          } else {
            allFillIn = false;
          }
        }
      });

      // console.log(originArr);

      // 学号处理
      originArr.forEach(it => {
        if (it.studentID) {
          if (isNumber(it.studentID)) {
            if (it.studentID.length < 2) {
              it.studentID = `0${it.studentID}`;
            }
          }
        }
      });

      // 判断是否 已生成一条空数据
      const emptyObj = originArr.find(
        it => it.studentID === '' || it.name === '' || it.borrowing === ''
      );
      if (emptyObj) {
        allFillIn = false;
      }

      // if (allFillIn) {
      //   originArr.unshift({
      //     error: '',
      //     key: 0,
      //     studentID: '',
      //     name: '',
      //     gender: '',
      //     borrowing: '',
      //     warn: '',
      //   });
      // }

      this.setState(
        {
          dataSource: originArr,
        },
        () => {
          this.validateData();
        }
      );
    }
  };

  // 取消按钮
  onHandleCancel = () => {
    const originArr = this.state.dataSource;
    if (originArr.length > 1) {
      this.setState({
        modalVisable: true,
      });
    } else {
      this.props.history.goBack();
    }
  };

  // 点击面包屑跳转到行政班页面
  gotoAdmin = item => {
    const { location } = this.props;
    const curItem = location.state ? location.state.curItem : '';
    router.push({
      pathname: `/classallocation/classmanage/admin/${item.naturalClassId ||
        curItem.naturalClassId}`,
    });
  };

  // 提示信息弹窗
  onHandleModalCancel = () => {
    this.setState({
      modalVisable: false,
    });
  };

  onHandleModalOK = () => {
    this.setState({
      modalVisable: false,
    });
    this.props.history.goBack();
  };

  render() {
    const { dataSource, importBtnDisabled, loading, studentNumber, curItem } = this.state;
    const { currentNaturalTeach, checkLoading } = this.props;
    // console.log(dataSource);
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    const columns = this.columns().map(col => {
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
          handleInput: this.handleInput,
        }),
      };
    });

    return (
      <div className="import-students-wrapper">
        <h1 className="menuName">
          <Link to="/classallocation/classmanage">
            <span>
              {formatMessage(messages.classmanage)}
              <i>/</i>
            </span>
          </Link>
          <span style={{ cursor: 'pointer' }} onClick={() => this.gotoAdmin(curItem)}>
            {currentNaturalTeach.alias || currentNaturalTeach.className}
            <i>/</i>
          </span>
          {formatMessage(messages.classwork)}
        </h1>
        <PageHeaderWrapper wrapperClassName="wrapperMain">
          <div className="import-students-component">
            <div className="content clearfix">
              <Col span={18}>
                <div className="table-box">
                  <div className="tip">
                    <p>
                      <i className="iconfont icon-tip" />
                      <span>{formatMessage(messages.importTip)}</span>
                    </p>
                  </div>
                  <div className="table" onPaste={this.onHandleTablePaste}>
                    {loading ? (
                      <div className="mask">
                        <div className="load-content">
                          <img className="loading" src={loadingGif} alt="loading" />
                          <div className="tip">{formatMessage(messages.loadingTip)}</div>
                        </div>
                      </div>
                    ) : null}
                    <Table
                      columns={columns}
                      components={components}
                      dataSource={dataSource}
                      pagination={false}
                      bordered
                      scroll={{ y: 580 }}
                    />
                  </div>
                  <div className="btn-group">
                    <Button className="cancel-btn" onClick={this.onHandleCancel}>
                      {formatMessage(messages.cancel)}
                    </Button>
                    <Button
                      className={importBtnDisabled ? 'import-btn-disable' : 'import-btn'}
                      disabled={checkLoading ? checkLoading : importBtnDisabled}
                      style={{ marginLeft: 10 }}
                      loading={loading}
                      onClick={() => {
                        this.checkData();
                      }}
                    >
                      {loading
                        ? formatMessage(messages.importBtnTit1)
                        : formatMessage(messages.importBtnTit)}
                    </Button>
                  </div>
                </div>
              </Col>
              <Col span={6} style={{ height: '100%' }}>
                <div className="operation-guidance">
                  <h2>{formatMessage(messages.guide)}</h2>
                  <div className="step-box">
                    <h2 className="title">Step1</h2>
                    <i
                      className="iconfont icon-excel"
                      onClick={() => {
                        this.downTempMethod();
                      }}
                    >
                      <a>{formatMessage(messages.downTemp)}</a>
                    </i>
                  </div>
                  <div className="step-box">
                    <h2 className="title">Step2</h2>
                    <p>{formatMessage(messages.guideStep2)}</p>
                    <div className="template-table-box clearfix">
                      <img src={excelStudentPic} />
                    </div>
                  </div>
                  <div className="step-box">
                    <h2 className="title">Step3</h2>
                    <p>{formatMessage(messages.guideStep3)}</p>
                  </div>
                  <div className="step-box">
                    <h2 className="title">Step4</h2>
                    <p>{formatMessage(messages.guideStep4)}</p>
                  </div>
                </div>
              </Col>
            </div>

            <Modal
              title=""
              okText={formatMessage(messages.confirm)}
              cancelText={formatMessage(messages.cancel)}
              visible={this.state.modalVisable}
              onCancel={this.onHandleModalCancel}
              onOk={this.onHandleModalOK}
              centered
              closable={false}
              width="380px"
              className="delete-modal"
            >
              <p className="content">{formatMessage(messages.backTip)}</p>
            </Modal>

            <Modal
              title=""
              okText=""
              cancelText=""
              visible={this.state.importSuccessVisable}
              centered
              closable={false}
              width={460}
              className="import-success-modal"
            >
              <div className="conent">
                <div className="success-icon">
                  <i className="iconfont icon-right success" />
                </div>
                <p className="tip">
                  <FormattedMessage
                    values={{ number: studentNumber }}
                    {...messages.importSuccess}
                  />
                </p>
                <div className="btn-group">
                  <Button
                    className="again-import-btn"
                    onClick={() => {
                      const initData = [
                        {
                          error: '',
                          key: 0,
                          studentId: '',
                          name: '',
                          gender: '',
                          borrowing: '',
                          warn: '',
                        },
                      ];
                      this.setState({
                        importSuccessVisable: false,
                        importBtnDisabled: true,
                        dataSource: initData,
                      });
                    }}
                  >
                    {formatMessage(messages.continueImport)}
                  </Button>
                  <Button
                    className="back-list-btn"
                    onClick={() => {
                      this.setState({
                        importSuccessVisable: false,
                      });
                      this.props.history.goBack();
                    }}
                  >
                    {formatMessage(messages.backList)}
                  </Button>
                </div>
              </div>
            </Modal>

            {/* 近期删除学生提示弹窗  */}
            <ImportDeleteModal
              visible={this.state.nearDeleteModal}
              restoreName={this.state.restoreName}
              onCancel={() => {
                this.setState({
                  nearDeleteModal: false,
                });
              }}
              onOK={recoveryData => {
                // console.log(recoveryData);
                this.setState({
                  nearDeleteModal: false,
                });
                this.recoveryData = recoveryData;
                this.onHandleImport();
              }}
            />
          </div>
        </PageHeaderWrapper>
      </div>
    );
  }
}

export default connect(({ clzss, loading }) => ({
  clzss,
  currentNaturalTeach: clzss.currentNaturalTeach,
  checkLoading: loading.effects['clzss/postDuplicateStudents'],
}))(ImportTeachersComponent);
