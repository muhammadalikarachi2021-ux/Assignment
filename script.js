const studentRollInput = document.getElementById('studentRoll');
const studentNameInput = document.getElementById('studentName');
const addStudentBtn = document.getElementById('addStudentBtn');
const recordAttendanceBtn = document.getElementById('recordAttendanceBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const clearBtn = document.getElementById('clearBtn');
const attendanceTable = document.getElementById('attendanceTable').querySelector('tbody');
const currentDate = document.getElementById('currentDate');
const savedCount = document.getElementById('savedCount');
const presentCount = document.getElementById('presentCount');
const absentCount = document.getElementById('absentCount');
const totalCount = document.getElementById('totalCount');

const STORAGE_KEY = 'attendanceSystemStudents';
let students = [];

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function updateDate() {
  currentDate.textContent = formatDate(new Date());
}

function loadStudents() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    students = JSON.parse(saved);
  }
}

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  savedCount.textContent = students.length;
  updateSummary();
}

function updateSummary() {
  const present = students.filter((student) => student.status === 'present').length;
  const absent = students.filter((student) => student.status === 'absent').length;
  presentCount.textContent = present;
  absentCount.textContent = absent;
  totalCount.textContent = students.length;
}

function renderTable() {
  attendanceTable.innerHTML = '';

  if (students.length === 0) {
    const row = document.createElement('tr');
    row.className = 'empty-row';
    row.innerHTML = '<td colspan="4">Add students to begin taking attendance.</td>';
    attendanceTable.appendChild(row);
    return;
  }

  students.forEach((student, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${student.name}</td>
      <td>${student.roll}</td>
      <td><button class="status-button present ${student.status === 'present' ? 'active' : ''}" data-index="${index}" data-value="present">Present</button></td>
      <td><button class="status-button absent ${student.status === 'absent' ? 'active' : ''}" data-index="${index}" data-value="absent">Absent</button></td>
    `;
    attendanceTable.appendChild(row);
  });
}

function addStudent() {
  const roll = studentRollInput.value.trim();
  const name = studentNameInput.value.trim();

  if (!roll || !name) {
    alert('Please enter both roll number and student name.');
    return;
  }

  students.push({ roll, name, status: 'absent' });
  studentRollInput.value = '';
  studentNameInput.value = '';
  renderTable();
  saveStudents();
}

function updateStatus(index, value) {
  students[index].status = value;
  renderTable();
  saveStudents();
}

function recordAttendance() {
  if (students.length === 0) {
    alert('Add at least one student before saving attendance.');
    return;
  }

  students = students.map((student) => ({ ...student, status: student.status || 'absent' }));
  saveStudents();
  alert('Attendance saved successfully.');
}

function exportCsv() {
  if (students.length === 0) {
    alert('No students to export.');
    return;
  }

  const headers = ['Roll Number', 'Student Name', 'Attendance Status'];
  const rows = students.map((student) => [student.roll, student.name, student.status || 'absent']);
  const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `attendance-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function clearAll() {
  if (!confirm('Clear all students and attendance records?')) return;

  students = [];
  saveStudents();
  renderTable();
}

addStudentBtn.addEventListener('click', addStudent);
recordAttendanceBtn.addEventListener('click', recordAttendance);
exportCsvBtn.addEventListener('click', exportCsv);
clearBtn.addEventListener('click', clearAll);

document.addEventListener('DOMContentLoaded', () => {
  updateDate();
  loadStudents();
  renderTable();
  savedCount.textContent = students.length;
  updateSummary();
});

attendanceTable.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button || !button.dataset.index) return;

  const index = Number(button.dataset.index);
  const value = button.dataset.value;
  updateStatus(index, value);
});
