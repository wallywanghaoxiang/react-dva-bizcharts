import React, { Component } from 'react';
import './index.less';
import { Col, Table, Button, Input, Form, Modal, message } from 'antd';
import { connect } from 'dva';
import excel from '@/utils/excel';
import { formatMessage, defineMessages, FormattedMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { isAvailableIphone, Trim } from '@/utils/utils';
import excelTeacherPic from '@/assets/teacher/excel_teacher_pic.png';
import loadingGif from '@/assets/loading.gif';

const messages = defineMessages({
  name: { id: 'app.import.teacher.table.header.name', defaultMessage: '姓名' },
  mobile: { id: 'app.import.teacher.table.header.mobile', defaultMessage: '手机号' },
  errorNum: {
    id: 'app.import.teacher.table.header.err.number',
    defaultMessage: '检测到{number}处错误信息',
  },
  teacherNameTip: {
    id: 'app.import.teacher.table.teacher.name.tip',
    defaultMessage: '姓名信息缺失',
  },
  teacherMobileTip: {
    id: 'app.import.teacher.table.teacher.mobile.tip',
    defaultMessage: '手机号信息缺失',
  },
  teacherMobileTip1: {
    id: 'app.import.teacher.table.teacher.mobile.tip1',
    defaultMessage: '手机号导入格式不正确',
  },
  teacherMobileTip2: {
    id: 'app.import.teacher.table.teacher.mobile.tip2',
    defaultMessage: '此手机号重复录入',
  },
  teacherNameTip1: {
    id: 'app.import.teacher.table.teacher.name.tip1',
    defaultMessage: '姓名重复，请检查是否录入有误',
  },
  teacherNameTip2: {
    id: 'app.import.teacher.table.teacher.name.tip2',
    defaultMessage: '系统中已有该教师名称，请检测是否为同一人',
  },
  teacherMobileTip3: {
    id: 'app.import.teacher.table.teacher.mobile.tip3',
    defaultMessage: '手机号已存在，继续导入将覆盖当前手机号、姓名',
  },
  teachermanage: { id: 'app.menu.teachermanage', defaultMessage: '教师' },
  import: { id: 'app.teacher.account.import', defaultMessage: '导入' },
  importTip: {
    id: 'app.import.teacher.header.tip',
    defaultMessage: '请在表格中输入教师信息，您也可以直接将Excel中教师信息复制粘贴到表格中',
  },
  loadingTip: { id: 'app.import.teacher.loading.tip', defaultMessage: '正在导入…请稍候' },
  cancel: { id: 'app.cancel', defaultMessage: '取消' },
  confirm: { id: 'app.confirm', defaultMessage: '确定' },
  importBtnTit: { id: 'app.import.teacher.import.btn.title', defaultMessage: '导入' },
  importBtnTit1: { id: 'app.import.teacher.import.btn.title1', defaultMessage: '正在导入' },
  guide: { id: 'app.import.guide.title', defaultMessage: '操作引导' },
  downTemp: { id: 'app.import.guide.down.template', defaultMessage: '下载模板' },
  guideStep2: {
    id: 'app.import.guide.step2.title',
    defaultMessage: '打开Excel，选择需要上传的教师姓名、手机号码等信息并复制。',
  },
  guideStep3: {
    id: 'app.import.guide.step3.title',
    defaultMessage: '点击左侧表格按Ctrl+V(粘贴)，填入教师信息。',
  },
  guideStep4: { id: 'app.import.guide.step4.title', defaultMessage: '点击【导入】按钮' },
  backTip: { id: 'app.import.back.tip', defaultMessage: '有未提交的信息确认要返回吗？' },
  importSuccess: {
    id: 'app.import.teacher.success',
    defaultMessage: '导入教师（{number}人）成功!',
  },
  continueImport: { id: 'app.import.continue.btn.title', defaultMessage: '继续导入' },
  backList: { id: 'app.import.back.list', defaultMessage: '返回列表' },
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

  // initInput(record,dataIndex) {
  //   if (dataIndex&&dataIndex=='studentId') {
  //     //学号
  //     <Input
  //         ref={node => (this.input = node)}
  //         onPressEnter={this.save}
  //         onChange={this.handleInputChange}
  //         onBlur={this.handleInputBlur}
  //         value={this.state.inputValue ? this.state.inputValue : record[dataIndex]}
  //     />
  //   }
  // }
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
        {editable ? (
          <Input
            ref={node => {
              this.input = node;
            }}
            value={inputValue && inputValue !== '' ? inputValue : record[dataIndex]}
            onChange={this.handleInputChange}
            onBlur={this.handleInputBlur}
            maxLength={dataIndex && dataIndex === 'name' ? 20 : 11}
          />
        ) : (
          restProps.children
        )}
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

    this.errNum = 0; //错误信息数量
    this.columns = () => {
      return [
        {
          title: formatMessage(messages.name),
          dataIndex: 'name',
          key: 'name',
          editable: true,
          width: '20%',
        },
        {
          title: formatMessage(messages.mobile),
          dataIndex: 'mobile',
          key: 'mobile',
          editable: true,
          width: '20%',
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
            //console.log(text,record);
            return (
              <p className="err" style={{ color: text ? '#FF6E4A' : '#FFB400' }}>
                {text ? text : record['warn']}
              </p>
            );
          },
        },
      ];
    };

    this.state = {
      modalVisable: false, // 取消弹窗
      importSuccessVisable: false, //导入成功
      importBtnDisabled: true,
      loading: false,
      tableTitle: [
        {
          title: '姓名',
          key: 'name',
        },
        {
          title: '手机号',
          key: 'phone',
        },
      ],
      tableData: [],
      dataSource: [
        {
          error: '',
          key: 0,
          name: '',
          mobile: '',
          warn: '',
        },
      ],
    };
  }

  componentDidMount() {}

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
    //console.log(e.clipboardData.getData('Text'));

    if (document.all)
      //判断IE浏览器
      window.event.returnValue = false;
    else e.preventDefault();

    //获取粘贴板数据
    var data = null;
    var clipboardData = window.clipboardData || e.clipboardData; // IE || chrome
    //console.log(clipboardData);
    data = clipboardData.getData('Text');
    // console.log(data.replace(/\t/g, '\\t').replace(/\n/g, '\\n')); //data转码

    //解析数据
    var ecxelData = data
      .split('\n')
      .filter(function(item) {
        //兼容Excel行末\n，防止出现多余空行
        return item !== '';
      })
      .map(function(item) {
        return item.split('\t');
      });

    // 数据清洗
    let arrStr = JSON.stringify(ecxelData);
    arrStr = arrStr.replace(/[\\r\\n]/g, ''); //去掉回车换行
    arrStr = arrStr.replace(/\s*/g, '');
    arrStr = arrStr.replace(/^[\s　]+|[\s　]+$/g, ''); //去掉全角半角

    let arr = JSON.parse(arrStr);

    if (arr[0].length > 1) {
      /*
       * 多条字段数据
       */

      const originData = this.state.dataSource;
      var new_Arr = new Array();
      arr.map((item, i) => {
        var obj = {};
        obj['error'] = '';
        obj['warn'] = '';
        item.map((item, index) => {
          //匹配数据 根据提取数据规则 目前没做什么规则 复制的什么就是什么
          obj['key'] = originData.length + i + 1;
          if (index === 0) {
            obj['name'] = item;
          } else if (index === 1) {
            obj['mobile'] = item;
          }
        });
        new_Arr.push(obj);
      });

      var list;
      if (this.state.dataSource.length > 1) {
        //有数据

        const oldArr = this.state.dataSource;
        // oldArr.shift(); //去掉第一个空数据

        // new_Arr.unshift({
        //   error: '',
        //   key: 0,
        //   name: '',
        //   mobile: '',
        //   warn: '',
        // });

        list = [...new_Arr, ...oldArr];
        this.setState(
          {
            dataSource: list,
          },
          () => {
            this.validateData();
          }
        );
      } else {
        //无数据

        list = [...this.state.dataSource, ...new_Arr];
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
      //找到当前td
      var td = e.target.parentNode;
      const rowIndex = td.parentNode.rowIndex;
      const cellIndex = td.cellIndex;
      //console.log(rowIndex,cellIndex);

      //判断是新增一条数据还是更新数据 老版本：this.state.dataSource.length < rowIndex+1 || this.state.dataSource.length == rowIndex+1
      if (rowIndex === 0) {
        console.log('新增数据');

        var originArr = this.state.dataSource;
        let obj = originArr[0];
        originArr.forEach((tag, i) => {
          if (i === 0) {
            if (cellIndex == 0) {
              tag['name'] = arr[0][0];
            } else if (cellIndex == 1) {
              tag['mobile'] = arr[0][0];
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
          //console.log(item,index);

          if (index == rowIndex) {
            //找到对应的数据更新对象属性值
            if (cellIndex == 0) {
              item['name'] = arr[0][0];
            } else if (cellIndex == 1) {
              item['mobile'] = arr[0][0];
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

  // 数据校验
  validateData() {
    const originArr = JSON.parse(JSON.stringify(this.state.dataSource));
    originArr.forEach(obj => {
      obj.error = '';
      obj.warn = '';
    });

    // 去重处理 TODO 去重复
    let strArr = [];
    originArr.map(it => {
      //处理空白数据
      if (it.mobile || it.name) {
        const obj = {
          name: it.name,
          mobile: it.mobile,
        };
        const itStr = JSON.stringify(obj);
        strArr.push(itStr);
      }
    });

    var uniqueArr = new Set(strArr);

    let objArr = Array.from(uniqueArr);

    let arr = [];
    objArr.map((i, n) => {
      const obj = {
        name: JSON.parse(i).name,
        mobile: JSON.parse(i).mobile,
        key: n + 1,
        error: '',
        warn: '',
      };

      arr.push(obj);
    });

    var new_arr = arr;

    const newObject = new_arr.reduce(
      (total, currentValue, currentIndex, arr) => {
        // 1. 必填验证
        const tag = currentValue;
        if (!tag.name || Trim(tag.name, 'g') === '') {
          tag.error = formatMessage(messages.teacherNameTip);
        } else if (tag.name.length > 20) {
          tag.error = formatMessage({
            id: 'app.message.import.teacher.name.tip',
            defaultMessage: '教师姓名字符长度超过20',
          });
        } else if (!tag.mobile) {
          tag.error = formatMessage(messages.teacherMobileTip);
        } else if (!isAvailableIphone(tag.mobile)) {
          tag.error = formatMessage(messages.teacherMobileTip1);
        } else {
          // 都填写了
        }

        const oldName = total['name'][currentValue['name']] || [];
        total['name'][currentValue['name']] = [...oldName, currentValue];

        const mobile = currentValue['mobile'];
        const oldMobile = total['mobile'][mobile] || [];
        total['mobile'][mobile] = [...oldMobile, currentValue];

        return total;
      },
      {
        name: {},
        mobile: {},
      }
    );

    //console.log(newObject);

    const mobileObj = newObject['mobile'];
    Object.keys(mobileObj).forEach(it => {
      const value = mobileObj[it];
      if (value.length > 1) {
        value.forEach(tag => {
          if (tag.error == '') {
            tag.error = formatMessage(messages.teacherMobileTip2);
          }
        });
      }
    });

    const nameObj = newObject['name'];

    Object.keys(nameObj).forEach(it => {
      const value = nameObj[it];
      if (value.length > 1) {
        value.forEach(tag => (tag.warn = formatMessage(messages.teacherNameTip1)));
      }
    });

    //console.log(new_arr);

    //let hasErr = false;
    if (new_arr.length > 0) {
      let hasErr = false;
      for (var i = 0; i < new_arr.length; i++) {
        const obj = new_arr[i];
        if (obj.error === '') {
          hasErr = false;
        } else {
          hasErr = true;
          break;
        }
      }

      //新增一条数据
      // var obj = {
      //   error: '',
      //   key: 0,
      //   name: '',
      //   mobile: '',
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
        // 3.前段验证没错误，开始后端验证手机号是否重复
        const { dispatch } = this.props;
        // 提交的数据
        // new_arr.shift();
        var studentList = new_arr.map(item => {
          return this.initStudentOBJ(item);
        });
        studentList.forEach((tag, idx) => {
          tag.index = idx;
        });
        var teachers = studentList;
        dispatch({
          type: 'teachermanage/checkMobile',
          payload: teachers,
          callback: res => {
            //console.log(res);
            if (res.responseCode == '200') {
              const resData = res.data;
              // 检索出重复手机号
              resData.map(item => {
                if (item.isSameMobile) {
                  // 手机号相同
                  new_arr.forEach((it, i) => {
                    if (item.index === i) {
                      it.warn = formatMessage(messages.teacherMobileTip3);
                    }
                  });
                }

                if (item.isSameName) {
                  new_arr.forEach((it, i) => {
                    if (item.index === i) {
                      if (!it.warn) {
                        it.warn = formatMessage(messages.teacherNameTip2);
                      }
                    }
                  });
                }
              });
              var obj = {
                error: '',
                key: 0,
                name: '',
                mobile: '',
                warn: '',
              };
              new_arr.unshift(obj);
              this.errNum = 0;
              this.setState({
                dataSource: new_arr,
                importBtnDisabled: false,
              });
            } else {
              const mgs = res.data;
              message.warning(mgs);
            }
          },
        });
      }
    } else {
      this.setState({
        importBtnDisabled: true,
      });
    }
  }

  //导入按钮
  onHandleImport = () => {
    const arr = this.state.dataSource;
    //arr.pop();

    //处理空白数据
    var new_arr = new Array();
    arr.map(item => {
      if (item.mobile || item.name) {
        new_arr.push(item);
      }
    });

    // 提交的数据
    var studentList = new_arr.map(item => {
      return this.initStudentOBJ(item);
    });

    const { dispatch } = this.props;

    const list = studentList;

    this.setState({
      loading: true,
      teacherNumber: list.length,
    });
    dispatch({
      type: 'teachermanage/importTeacher',
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
    var obj = {
      campusId: campusId, //校区id
      name: item.name,
      mobile: item.mobile,
    };
    return obj;
  };

  //input框监听
  handleInput = (rowIndex, cellIndex, value) => {
    console.log(rowIndex, cellIndex, value);
    // 老版本判断新增： this.state.dataSource.length < rowIndex+1 || this.state.dataSource.length == rowIndex+1
    if (rowIndex === 0) {
      //新增一条数据
      console.log(this);
      var originArr = this.state.dataSource;
      // let obj = originArr[0];
      originArr.forEach((tag, i) => {
        if (i === 0) {
          if (cellIndex == 0) {
            tag['name'] = value;
          } else if (cellIndex == 1) {
            tag['mobile'] = value;
          }
        }
      });

      // var new_Arr = new Array();
      // new_Arr.push(obj);

      this.setState(
        {
          dataSource: originArr,
        },
        () => {
          this.validateData();
        }
      );
    } else {
      console.log('跟新');
      console.log(this);
      const originArr = this.state.dataSource;
      let allFillIn = false;
      originArr.forEach((item, index) => {
        //console.log(item,index);

        if (index == rowIndex) {
          //找到对应的数据更新对象属性值
          if (cellIndex == 0) {
            item['name'] = value;
          } else if (cellIndex == 1) {
            item['mobile'] = value;
          }
          if (item.name && item.mobile) {
            allFillIn = true;
          } else {
            allFillIn = false;
          }
        }
      });
      // 判断是否 已生成一条空数据
      const emptyObj = originArr.find(it => it.name === '' || it.mobile === '');
      if (emptyObj) {
        allFillIn = false;
      }

      //console.log(originArr);

      // if (allFillIn) {
      //   originArr.unshift({
      //     error: '',
      //     key: rowIndex+1,
      //     name: '',
      //     mobile: '',
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

  //取消按钮
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

  // 下载模板方法
  downTempMethod = () => {
    const { tableData } = this.state;
    const params = {
      title: ['姓名', '手机号'],
      key: ['name', 'phone'],
      data: tableData,
      autoWidth: true,
      filename: '教师导入',
    };
    excel.export_array_to_excel(params);
  };

  //提示信息弹窗
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
    const { dataSource, importBtnDisabled, loading, teacherNumber } = this.state;
    console.log(dataSource);
    const showData = JSON.parse(JSON.stringify(dataSource));
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    const { handleInput } = this;
    const columns = this.columns().map(col => {
      // if (!col.editable) {
      //   return col;
      // }
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
          handleInput: handleInput,
        }),
      };
    });

    return (
      <div className="import-teacher-wrapper">
        <h1 className="tit">
          {formatMessage(messages.teachermanage)}
          <span className="division">/</span>
          <span className="subTit">{formatMessage(messages.import)}</span>
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
                      dataSource={showData}
                      pagination={false}
                      bordered={true}
                      scroll={{ y: 580 }}
                    />
                  </div>
                  <div className="btn-group">
                    <Button className="cancel-btn" onClick={this.onHandleCancel}>
                      {formatMessage(messages.cancel)}
                    </Button>
                    <Button
                      className={importBtnDisabled ? 'import-btn-disable' : 'import-btn'}
                      disabled={importBtnDisabled}
                      style={{ marginLeft: 10 }}
                      loading={loading}
                      onClick={this.onHandleImport}
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
                      <img src={excelTeacherPic} />
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
              centered={true}
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
              centered={true}
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
                    values={{ number: teacherNumber }}
                    {...messages.importSuccess}
                  ></FormattedMessage>
                </p>
                <div className="btn-group">
                  <Button
                    className="again-import-btn"
                    onClick={() => {
                      const initData = [
                        {
                          error: '',
                          key: 0,
                          name: '',
                          mobile: '',
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
          </div>
        </PageHeaderWrapper>
      </div>
    );
  }
}

export default connect(({ teachermanage }) => ({
  teachermanage,
}))(ImportTeachersComponent);
