/**
 * 代理教师选择
 * @author tina
 */
import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import './index.less';
import IconButton from '@/frontlib/components/IconButton';
import AddTeacherModal from '@/pages/ClassAllocation/pages/ClassManage/components/AddTeacherModal';
import TeacherAvatar from '../components/TeacherAvatar';

@connect(({ release }) => ({
  taskType: release.taskType,
  selectedTeacher: release.selectedTeacher,
}))
class TestSet extends PureComponent {
  state = {
    visibleAddModal: false,
  };

  componentDidMount() {}

  render() {
    const { visibleAddModal } = this.state;
    const { selectedTeacher, dispatch } = this.props;
    return (
      <div className="setPaper">
        <h2>
          {formatMessage({
            id: 'app.examination.inspect.task.detail.exam.teacher.title',
            defaultMessage: '代课教师',
          })}
        </h2>
        <div className="setResult">
          {selectedTeacher.teacherName ? (
            <div className="teacherAvatar">
              <TeacherAvatar
                selectedTeacher={selectedTeacher}
                key={selectedTeacher.teacherId}
                onDel={() => {
                  dispatch({
                    type: 'release/saveTeacherInfo',
                    payload: {},
                  });
                }}
              />
              <div
                className="rechoose"
                onClick={() => {
                  this.setState({ visibleAddModal: true });
                }}
              >
                {formatMessage({
                  id: 'app.button.exam.publish.choose.once',
                  defaultMessage: '重新选择',
                })}
              </div>
            </div>
          ) : (
            <div>
              <IconButton
                text={formatMessage({
                  id: 'app.button.exam.publish.choose.teacher.title',
                  defaultMessage: '选择教师',
                })}
                iconName="iconfont icon-user"
                className="iconButton"
                textColor="textsColor"
                onClick={() => {
                  this.setState({ visibleAddModal: true });
                }}
              />
            </div>
          )}
          {/* 添加老师弹框组件 */}
          {visibleAddModal && (
            <AddTeacherModal
              visibleModal={visibleAddModal}
              title={formatMessage({
                id: 'app.button.exam.publish.choose.teacher.title',
                defaultMessage: '选择教师',
              })}
              hideModal={() => {
                this.setState({ visibleAddModal: !visibleAddModal });
              }}
              type="tsmk"
              callback={e => {
                dispatch({
                  type: 'release/saveTeacherInfo',
                  payload: e,
                });
              }}
            />
          )}
        </div>
      </div>
    );
  }
}

export default TestSet;
