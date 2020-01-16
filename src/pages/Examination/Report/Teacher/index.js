import React, { PureComponent } from 'react';
import TeacherReport from '@/frontlib/components/MissionReport/TeacherReport'

/**
 * 教师报告入口
 */
class Teacher extends PureComponent {

  render() {
    const { match } = this.props
    return (
      <TeacherReport taskId={match.params.id} type="line" />
    )

  }
}
export default Teacher;
