import React, { PureComponent } from 'react';
import StudentReport from '@/frontlib/components/MissionReport/StudentReport'

/**
 * 学生报告入口
 */
class Student extends PureComponent {

  render() {
    const { match } = this.props
    const { id, studentId, paperId } = match.params;
    return (
      <StudentReport taskId={id} studentId={studentId} paperId={paperId} />
    )
  }
}

export default Student;
