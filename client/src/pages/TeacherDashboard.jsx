import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { useDashboardData, useTableSort } from '../hooks';
import { ErrorMessage, LoadingSpinner, StatsGrid, TeacherAssignmentList, SortableTable } from '../components';

/**
 * TeacherDashboard component.
 * Displays the teacher's assignments and overall statistics
 * for students in the teacher's class.
 */
export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data, loading, error, refetch } = useDashboardData({
    assignments: '/api/assignments',
    classStatus: '/api/teacher/class-status'
  });
  
  const { sortField, sortDirection, handleSort, sortData } = useTableSort('avgScore', 'desc');

  if (loading) {
    return <LoadingSpinner message="Loading teacher dashboard..." />;
  }

  // Handle data extraction with safe defaults
  const assignments = Array.isArray(data.assignments) ? data.assignments : [];
  const classStatus = Array.isArray(data.classStatus) ? data.classStatus : [];

  // Separate assignments by status
  const openAssignments = assignments.filter(a => a.status === 'open');
  const closedAssignments = assignments.filter(a => a.status === 'closed');

  // Calculate summary statistics
  const totalAssignments = assignments.length;
  const totalOpen = openAssignments.length;
  const totalClosed = closedAssignments.length;
  
  // Calculate weighted average score for closed assignments
  const averageScore = closedAssignments.length > 0 
    ? (() => {
        const totalWeightedScore = closedAssignments.reduce((sum, a) => {
          const groupSize = a.groupMembers?.length || 1;
          return sum + (a.score || 0) / groupSize;
        }, 0);
        const totalWeight = closedAssignments.reduce((sum, a) => {
          const groupSize = a.groupMembers?.length || 1;
          return sum + 1 / groupSize;
        }, 0);
        return totalWeight > 0 ? (totalWeightedScore / totalWeight).toFixed(2) : 'N/A';
      })()
    : 'N/A';

  // Prepare stats for StatsGrid
  const stats = [
    { value: totalAssignments, label: 'Total Assignments' },
    { value: totalOpen, label: 'Open' },
    { value: totalClosed, label: 'Closed' },
    { value: averageScore, label: 'Average Score' }
  ];

  // Prepare table columns for class status
  const tableColumns = [
    { field: 'studentName', label: 'Student' },
    { 
      field: 'avgScore', 
      label: 'Avg. Score',
      render: (row) => row.avgScore !== null ? row.avgScore.toFixed(2) : '-'
    },
    { field: 'numOpen', label: 'Open' },
    { field: 'numClosed', label: 'Closed' },
    { 
      field: 'total', 
      label: 'Total',
      render: (row) => row.numOpen + row.numClosed
    }
  ];

  const sortedClassStatus = sortData(classStatus);

  return (
    <div className="dashboard">
      <h2>Teacher Dashboard</h2>

      <ErrorMessage error={error} onRetry={refetch} />

      {/* Button to create a new assignment */}
      <button onClick={() => navigate('/teacher/create')} className="primary-button mb-lg">
        Add New Assignment
      </button>

      <TeacherAssignmentList 
        assignments={openAssignments}
        title="Open Assignments"
        emptyMessage="No open assignments."
      />

      <StatsGrid stats={stats} />

      <TeacherAssignmentList 
        assignments={closedAssignments}
        title="Closed Assignments"
        emptyMessage="No closed assignments yet."
      />

      <h2>Class Status</h2>

      {classStatus.length === 0 ? (
        <p>No student data available yet.</p>
      ) : (
        <SortableTable 
          data={sortedClassStatus}
          columns={tableColumns}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      )}
    </div>
  );
}
