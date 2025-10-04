// src/pages/Dashboard.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ActivityTimeline from './ActivityTimeline';
import Analytics from './Analytics';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * Dashboard
 * - preserves your pipeline and charts
 * - adds responsive Officials Leaves calendar, leave modal, attendance modal
 * - fixes collapsing by adding explicit min-heights, overflow behaviors, and responsive layout rules
 */
function Dashboard({ leads = [], activities = [], users = [] }) {
  // ---------- Existing pipeline state ----------
  const [pipeline, setPipeline] = useState({
    New: leads.filter((lead) => lead.status === 'New'),
    Contacted: leads.filter((lead) => lead.status === 'Contacted'),
    Qualified: leads.filter((lead) => lead.status === 'Qualified'),
    Closed: leads.filter((lead) => lead.status === 'Closed'),
  });

  // ---------- Lead chart data (unchanged) ----------
  const leadSourceData = {
    labels: ['Website', 'Social Media', 'Referral', 'Email'],
    datasets: [
      {
        label: 'Leads by Source',
        data: [
          leads.filter((lead) => lead.source === 'Website').length,
          leads.filter((lead) => lead.source === 'Social Media').length,
          leads.filter((lead) => lead.source === 'Referral').length,
          leads.filter((lead) => lead.source === 'Email').length,
        ],
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#FF5722'],
        borderColor: ['#388E3C', '#1976D2', '#FFA000', '#D81B60'],
        borderWidth: 1,
      },
    ],
  };

  // optional dnd handler (left as-is)
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const sourceColumnId = active.data.current?.sortable?.containerId;
    const destinationColumnId = over.id;

    if (sourceColumnId && destinationColumnId && sourceColumnId !== destinationColumnId) {
      const sourceColumn = [...pipeline[sourceColumnId]];
      const destinationColumn = [...pipeline[destinationColumnId]];
      const [movedLead] = sourceColumn.splice(active.data.current.sortable.index, 1);
      movedLead.status = destinationColumnId;
      destinationColumn.push(movedLead);

      setPipeline({
        ...pipeline,
        [sourceColumnId]: sourceColumn,
        [destinationColumnId]: destinationColumn,
      });
    }
  };

  // =================== New Attendance / Leaves State ===================
  const [leaves, setLeaves] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [publicHolidays, setPublicHolidays] = useState([]);
  const [weekendHoliday, setWeekendHoliday] = useState(true);
  const weekendDays = [0]; // Sunday by default

  // Calendar view state
  const today = new Date();
  const [calendarDate, setCalendarDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(formatDate(today));

  // Modals
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  // prevent body scroll when modal open
  useEffect(() => {
    const modalOpen = showLeaveModal || showAttendanceModal;
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showLeaveModal, showAttendanceModal]);

  // ---------- Helpers ----------
  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }
  function formatDate(d) {
    if (!d) return '';
    const date = typeof d === 'string' ? new Date(d) : d;
    if (Number.isNaN(date.getTime())) return '';
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  // month navigation
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  function prevMonth() {
    setCalendarDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setCalendarDate(new Date(year, month + 1, 1));
  }

  // build calendar matrix (weeks)
  const calendarMatrix = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells = [];
    // prev month tail
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const d = new Date(year, month - 1, dayNum);
      cells.push({ date: formatDate(d), outOfMonth: true, day: dayNum });
    }
    // current month
    for (let dnum = 1; dnum <= daysInMonth; dnum++) {
      const d = new Date(year, month, dnum);
      cells.push({ date: formatDate(d), outOfMonth: false, day: dnum, weekday: d.getDay() });
    }
    // next month tail
    while (cells.length % 7 !== 0) {
      const nextDay = cells.length - (firstDayIndex + daysInMonth) + 1;
      const d = new Date(year, month + 1, nextDay);
      cells.push({ date: formatDate(d), outOfMonth: true, day: d.getDate() });
    }
    // return flat array of cells (we'll render in a 7-col grid)
    return cells;
  }, [calendarDate]);

  function leavesForDate(dateStr) {
    return leaves.filter((lv) => lv.from <= dateStr && lv.to >= dateStr);
  }

  function isHoliday(dateStr) {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return false;
    const weekday = d.getDay();
    if (weekendHoliday && weekendDays.includes(weekday)) return true;
    if (publicHolidays.some((h) => h.date === dateStr)) return true;
    if (leavesForDate(dateStr).length > 0) return true;
    return false;
  }

  function markAttendance(userId, dateStr, status = 'Present') {
    setAttendanceRecords((prev) => {
      const day = { ...(prev[dateStr] || {}) };
      day[userId] = status;
      return { ...prev, [dateStr]: day };
    });
  }

  function deleteLeave(id) {
    setLeaves((prev) => prev.filter((l) => l.id !== id));
    setEditingLeave(null);
    setShowLeaveModal(false);
  }

  function saveLeave(e) {
    e.preventDefault();
    const form = e.target;
    const title = form.title.value.trim() || 'Official Leave';
    const from = form.from.value;
    const to = form.to.value || from;
    const userId = form.user.value;
    const notes = form.notes.value.trim();

    if (!from) return alert('Please select a from date');

    if (editingLeave && editingLeave.id) {
      setLeaves((prev) => prev.map((l) => (l.id === editingLeave.id ? { ...l, title, from, to, userId, notes } : l)));
      setEditingLeave(null);
    } else {
      const newLeave = { id: 'l-' + Date.now(), title, from, to, userId, notes };
      setLeaves((prev) => [newLeave, ...prev]);
    }
    setShowLeaveModal(false);
  }

  function openEditLeave(lv) {
    setEditingLeave(lv);
    setShowLeaveModal(true);
  }

  function handleAttendanceSubmit(e) {
    e.preventDefault();
    const userId = e.target.user.value;
    const date = e.target.date.value;
    const status = e.target.status.value;
    if (!userId || !date) return alert('Select user and date');
    markAttendance(userId, date, status);
    setShowAttendanceModal(false);
  }

  function addPublicHoliday(e) {
    e.preventDefault();
    const name = e.target.hname.value.trim() || 'Holiday';
    const date = e.target.hdate.value;
    if (!date) return alert('Select date');
    setPublicHolidays((prev) => [{ id: 'h-' + Date.now(), name, date }, ...prev]);
    e.target.reset();
  }

  function userNameById(id) {
    if (id === 'ALL') return 'All';
    const u = users?.find((x) => x.id === id || x._id === id);
    return u ? u.name || u.fullName || u.email || u.username : 'Unknown';
  }

  // ================= Render =================
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"
    >
      {/* TOP KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border-l-4 border-green-500 min-h-[96px]">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Total Leads</h2>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">{leads.length}</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border-l-4 border-blue-500 min-h-[96px]">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Conversion Rate</h2>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">70%</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border-l-4 border-yellow-500 min-h-[96px]">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Active Deals</h2>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{leads.filter((l) => l.status !== 'Closed').length}</p>
        </motion.div>
      </div>

      {/* Charts + Timeline (responsive) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Leads by Source</h2>
          <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96">
            <Bar
              data={leadSourceData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' }, tooltip: { enabled: true } },
              }}
            />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-6 rounded-2xl shadow-lg border border-gray-100 min-h-[220px]">
          {/* wrap ActivityTimeline to keep min-height & scrolling on small screens */}
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Activity Timeline</h2>
          <div className="min-h-[180px] sm:min-h-[280px] md:min-h-[340px] overflow-auto">
            <ActivityTimeline activities={activities} leads={leads} />
          </div>
        </div>
      </div>

      <Analytics leads={leads} />

      {/* Admin Panels (Calendar + Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Calendar (left) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Officials Leaves — Calendar</h3>
              <p className="text-sm text-gray-500">Click a date to view / edit leaves. Add leave to mark official off days.</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setShowLeaveModal(true);
                  setEditingLeave(null);
                }}
                className="w-full sm:w-auto inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-md shadow hover:brightness-105"
              >
                + Add Leave
              </button>
              <button
                onClick={() => {
                  const todayStr = formatDate(new Date());
                  setSelectedDate(todayStr);
                  setCalendarDate(new Date(today.getFullYear(), today.getMonth(), 1));
                }}
                title="Go to today"
                className="px-3 py-2 rounded-md border hover:bg-gray-50"
              >
                Today
              </button>
            </div>
          </div>

          {/* calendar navigation */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="px-3 py-1 rounded-md border">◀</button>
              <div className="px-3 py-1 rounded-md font-medium">
                {calendarDate.toLocaleString('default', { month: 'long' })} {calendarDate.getFullYear()}
              </div>
              <button onClick={nextMonth} className="px-3 py-1 rounded-md border">▶</button>
            </div>
            <div className="text-sm text-gray-600">Selected: <span className="font-medium">{selectedDate}</span></div>
          </div>

          {/* calendar grid container */}
          <div className="overflow-auto" style={{ maxHeight: '640px' }}>
            <div
              className="grid grid-cols-7 gap-1 text-sm"
              // ensure rows don't collapse (keeps cards stable)
              style={{ gridAutoRows: 'minmax(84px, auto)' }}
            >
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-gray-500 py-1 bg-transparent">{d}</div>
              ))}

              {calendarMatrix.map((cell) => {
                const cellLeaves = leavesForDate(cell.date);
                const cellIsHoliday = isHoliday(cell.date);
                const isToday = cell.date === formatDate(new Date());
                const isSelected = cell.date === selectedDate;
                return (
                  <div
                    key={cell.date}
                    onClick={() => setSelectedDate(cell.date)}
                    className={`cursor-pointer p-2 rounded-lg border
                      ${cell.outOfMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                      ${isSelected ? 'ring-2 ring-indigo-200' : ''}
                      ${isToday ? 'border-indigo-300' : 'border-gray-100'}
                      flex flex-col justify-between
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className={`text-sm font-medium ${cell.outOfMonth ? 'text-gray-400' : 'text-gray-700'}`}>
                        {cell.day}
                      </div>
                      {cellIsHoliday && <div className="text-xs px-1 rounded bg-yellow-100 text-yellow-800">Holiday</div>}
                    </div>

                    {/* leaves badges at bottom; clip to avoid overflow */}
                    <div className="mt-2 space-y-1 overflow-hidden">
                      {cellLeaves.slice(0, 2).map((lv) => (
                        <button
                          key={lv.id}
                          onClick={(e) => { e.stopPropagation(); openEditLeave(lv); }}
                          className="w-full text-left text-xs bg-red-50 text-red-700 px-2 py-1 rounded-md cursor-pointer hover:bg-red-100"
                          title={`${lv.title} — ${userNameById(lv.userId)}`}
                        >
                          <div className="truncate">{lv.title} {lv.userId !== 'ALL' ? `(${userNameById(lv.userId)})` : ''}</div>
                        </button>
                      ))}
                      {cellLeaves.length > 2 && (
                        <div className="text-xs text-gray-500 truncate">+{cellLeaves.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected date details */}
          <div className="mt-4 border-t pt-3">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-gray-800">Details for {selectedDate}</h4>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => setShowAttendanceModal(true)}
                  className="px-3 py-2 rounded-md border hover:bg-gray-50 w-full md:w-auto"
                >
                  Mark Attendance
                </button>
                <button
                  onClick={() => { setShowLeaveModal(true); setEditingLeave({ from: selectedDate, to: selectedDate, userId: 'ALL', title: '' }); }}
                  className="px-3 py-2 rounded-md bg-indigo-600 text-white w-full md:w-auto"
                >
                  Add Leave on {selectedDate}
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 rounded min-h-[72px]">
                <div className="text-xs text-gray-500">Holiday?</div>
                <div className="text-sm font-medium">{isHoliday(selectedDate) ? 'Yes' : 'No'}</div>
              </div>

              <div className="p-3 bg-gray-50 rounded min-h-[72px]">
                <div className="text-xs text-gray-500">Leaves</div>
                <div className="text-sm mt-1">
                  {leavesForDate(selectedDate).length === 0 ? (
                    <span className="text-gray-500">No official leaves</span>
                  ) : (
                    leavesForDate(selectedDate).map((lv) => (
                      <div key={lv.id} className="flex items-center justify-between gap-2 py-1">
                        <div>
                          <div className="text-sm font-medium truncate">{lv.title}</div>
                          <div className="text-xs text-gray-500 truncate">{userNameById(lv.userId)} {lv.notes ? `— ${lv.notes}` : ''}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditLeave(lv)} className="text-xs px-2 py-1 rounded border">Edit</button>
                          <button onClick={() => deleteLeave(lv.id)} className="text-xs px-2 py-1 rounded border text-red-600">Delete</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded min-h-[72px]">
                <div className="text-xs text-gray-500">Attendance Notes</div>
                <div className="text-sm mt-1">
                  {attendanceRecords[selectedDate] ? (
                    <div>
                      {Object.entries(attendanceRecords[selectedDate]).map(([uid, st]) => (
                        <div key={uid} className="flex items-center justify-between py-1">
                          <div className="text-sm truncate">{userNameById(uid)}</div>
                          <div className="text-xs text-green-700">{st}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500">No marks</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column (Auto holiday info + quick attendance) */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <h4 className="text-lg font-semibold text-gray-800">Auto Holiday Info</h4>
              <p className="text-sm text-gray-500">Weekends + public holidays</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={weekendHoliday} onChange={() => setWeekendHoliday((v) => !v)} />
                Treat Weekends as Holidays
              </label>
            </div>

            <div>
              <div className="text-xs text-gray-500">Public Holidays</div>
              {publicHolidays.length === 0 ? (
                <div className="text-gray-500 text-sm py-2">No public holidays added.</div>
              ) : (
                <div className="space-y-2 mt-2 max-h-48 overflow-auto">
                  {publicHolidays.map((h) => (
                    <div key={h.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                      <div>
                        <div className="font-medium">{h.name}</div>
                        <div className="text-xs text-gray-500">{h.date}</div>
                      </div>
                      <div className="text-xs">
                        <button onClick={() => setPublicHolidays((prev) => prev.filter((x) => x.id !== h.id))} className="px-2 py-1 rounded border text-red-600">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={addPublicHoliday} className="flex gap-2 items-center">
              <input name="hname" placeholder="Holiday name" className="flex-1 px-3 w-12 py-2 border rounded" />
              <input name="hdate" type="date" className="px-3 py-2 border rounded" />
              <button type="submit" className="px-3 py-2 rounded bg-indigo-600 text-white">Add</button>
            </form>

            <div className="pt-2 border-t mt-2">
              <h5 className="text-sm font-semibold">Quick attendance</h5>
              <p className="text-xs text-gray-500">Mark attendance for users who forgot (or correct a mark).</p>
              <div className="mt-3">
                <button onClick={() => setShowAttendanceModal(true)} className="w-full px-3 py-2 rounded bg-green-600 text-white">Mark Attendance</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======= Leave Modal ======= */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/40"
            onClick={() => { setShowLeaveModal(false); setEditingLeave(null); }}
          />
          <motion.form
            initial={{ y: 20, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            onSubmit={saveLeave}
            className="relative z-50 w-full max-w-full sm:max-w-2xl bg-white rounded-2xl shadow-lg p-4 sm:p-6 mx-2"
          >
            <div className="flex items-center justify-between mb-4 gap-2">
              <h3 className="text-lg font-semibold">{editingLeave && editingLeave.id ? 'Edit Leave' : 'Add Official Leave'}</h3>
              <div className="flex items-center gap-2">
                {editingLeave && editingLeave.id && (
                  <button type="button" onClick={() => deleteLeave(editingLeave.id)} className="px-3 py-1 rounded border text-red-600">Delete</button>
                )}
                <button type="button" onClick={() => { setShowLeaveModal(false); setEditingLeave(null); }} className="px-3 py-1 rounded border">Close</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600">Title</label>
                <input name="title" defaultValue={editingLeave?.title || 'Official Leave'} className="mt-1 px-3 py-2 border rounded w-full" />
              </div>

              <div>
                <label className="block text-sm text-gray-600">User</label>
                <select name="user" defaultValue={editingLeave?.userId || 'ALL'} className="mt-1 px-3 py-2 border rounded w-full">
                  <option value="ALL">All Users</option>
                  {users?.map((u) => <option key={u.id || u._id} value={u.id || u._id}>{u.name || u.fullName || u.email}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600">From</label>
                <input name="from" type="date" defaultValue={editingLeave?.from || selectedDate} className="mt-1 px-3 py-2 border rounded w-full" />
              </div>

              <div>
                <label className="block text-sm text-gray-600">To (optional)</label>
                <input name="to" type="date" defaultValue={editingLeave?.to || selectedDate} className="mt-1 px-3 py-2 border rounded w-full" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600">Notes</label>
                <textarea name="notes" defaultValue={editingLeave?.notes || ''} className="mt-1 px-3 py-2 border rounded w-full" rows={3} />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button type="button" onClick={() => { setShowLeaveModal(false); setEditingLeave(null); }} className="px-3 py-2 rounded border">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white">{editingLeave ? 'Save Changes' : 'Add Leave'}</button>
            </div>
          </motion.form>
        </div>
      )}

      {/* ======= Attendance Modal ======= */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/40" onClick={() => setShowAttendanceModal(false)} />
          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onSubmit={handleAttendanceSubmit}
            className="relative z-50 w-full max-w-md bg-white rounded-2xl shadow-lg p-4 sm:p-6 mx-2"
          >
            <h3 className="text-lg font-semibold mb-3">Mark Attendance</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600">User</label>
                <select name="user" className="mt-1 px-3 py-2 border rounded w-full">
                  <option value="">Select user</option>
                  {users?.map((u) => <option key={u.id || u._id} value={u.id || u._id}>{u.name || u.fullName || u.email}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600">Date</label>
                <input name="date" type="date" defaultValue={selectedDate} className="mt-1 px-3 py-2 border rounded w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Status</label>
                <select name="status" defaultValue="Present" className="mt-1 px-3 py-2 border rounded w-full">
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setShowAttendanceModal(false)} className="px-3 py-2 rounded border">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white">Save</button>
            </div>
          </motion.form>
        </div>
      )}
    </motion.div>
  );
}

export default Dashboard;
