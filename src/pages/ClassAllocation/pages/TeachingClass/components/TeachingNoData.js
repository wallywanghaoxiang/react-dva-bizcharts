/**
 *
 * User: tina.zhang
 * Explain: 教学班空数据的情况下
 *
 * */
import React, { Component } from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import { Button,Tooltip } from 'antd';
import studentHead from '@/assets/class/student_head.png';
import router from 'umi/router';
import styles from './index.less';

const messages = defineMessages({
  teachingNoData: { id: 'app.menu.classallocation.adminNoData', defaultMessage: '您的班级还没有学生哦，快快调入学生吧！' },
  addStudent: { id: 'app.menu.classallocation.addStudent', defaultMessage: '调入学生' },

});


class TeachingNoData extends Component {
  state = {};

  gotoClasswork = () => {
    const {grade, id, name, lastDays, subjectId,curItem } = this.props;
    router.push({
      pathname: `/classallocation/classmanage/teaching/${id}/ClassWork`,
      state: {
        grade, id, lastDays, curAlias: name, subjectId,curItem
      },
    });
  };

  render() {
    const { addStudent, lastDays } = this.props;
    const ShowBtnMessage = () => (
      <div>
        {
          (lastDays === 0 ||lastDays === null) ?
            <div style={{ width: '190px', height: '36px', 'line-height': '18px' }}>
              <div>
                <div style={{ fontSize: 13 }}>{formatMessage({id:"app.text.Non-AlternatingPeriodNotOperating",defaultMessage:"非异动期不可操作，如需操作"})}，</div>
                <div style={{ fontSize: 13 }}>{formatMessage({id:"app.text.Pleasecontacttheadministratortoopenthechange",defaultMessage:"请联系管理员开启异动"})}</div>
              </div>
            </div> : null
        }
      </div>
    );
    return (
      <div className={styles.teachingNoData}>
        <img className={styles.classImg} src={studentHead} alt='' />
        <div>
          {formatMessage(messages.teachingNoData)}
        </div>
        <div className={styles.manager}>
          {addStudent ?
            
            <Tooltip
              placement="top"
              title={(lastDays === 0 || lastDays === null) ? <ShowBtnMessage /> : ''}
            >
              <div>
                <Button
                  className={styles.addStudents}
                  onClick={addStudent}
                  disabled={lastDays === 0 || lastDays === null}
                ><i
                  className="iconfont icon-add"
                />{formatMessage(messages.addStudent)}
                </Button>
              </div>
            </Tooltip>
           
           :
            <Button className={styles.gotoClasswork} onClick={() => this.gotoClasswork()}>
              <i className="iconfont icon-logout" />
                {formatMessage({id:"app.menu.classallocation.classwork",defaultMessage:"班务管理"})}
            </Button>
          }
        </div>
      </div>
    );
  }
}

export default TeachingNoData;
