/**
 * Demo data for the site's screenshots.
 *
 * The capture tool writes this into the browser build's `localStorage` before
 * the app starts, so every screenshot shows a real, reachable state of the real
 * application instead of an empty first run. Nothing here is drawn or retouched:
 * the app computes every number on the page from these rows.
 *
 * The dates are relative to the capture run, so "this month" is always the
 * month the screenshots were taken in. The shape is deliberately stable: four
 * months of focus sessions, a daily Code review habit, a handful of tasks with
 * dates, habits with a few misses, a journal, water and one standing reminder.
 */

const iso = (d) => d.toISOString();
const at = (daysAgo, hour, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d;
};
const dayKey = (daysAgo) => {
  const d = at(daysAgo, 12);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const isWeekend = (daysAgo) => {
  const day = at(daysAgo, 12).getDay();
  return day === 0 || day === 6;
};

let counter = 0;
const nextId = (prefix) => `${prefix}-${String(++counter).padStart(4, '0')}`;

const today = dayKey(0);

const settings = {
  workDuration: 1500,
  shortBreak: 300,
  longBreak: 900,
  sessionsBeforeLongBreak: 4,
  notificationSound: 'chime',
  notificationRepeatInterval: 60,
  alertShakeMs: 900,
  trayBehavior: 'minimize',
  theme: 'system',
  startWithSystem: true,
  alwaysOnTop: false,
  desktopPrefsPrompted: true,
  launchPrompted: true,
  startupNudge: false,
  taskbarPinNudge: true,
  waterReminders: true,
  waterStart: '09:00',
  waterEnd: '18:00',
  waterIntervalMinutes: 60,
  waterAmountMl: 250,
  waterGoalMl: 2000,
  waterAutoLogWhenMinimized: true,
  carryForwardTasks: true,
};

const tasks = [];

function addTask(task, extra = {}) {
  tasks.push({
    id: task.id,
    title: task.title,
    description: task.description ?? '',
    priority: task.priority ?? 2,
    status: task.status ?? 'todo',
    quadrant: task.quadrant ?? null,
    deadline: task.deadline ?? null,
    tags: task.tags ?? [],
    recurrence: task.recurrence ?? null,
    todayOrder: task.todayOrder ?? null,
    todayOrderDate: task.todayOrder ? today : null,
    createdAt: task.createdAt ?? iso(at(20, 9)),
    completedAt: task.status === 'done' ? iso(at(1, 17)) : null,
    updatedAt: task.createdAt ?? iso(at(20, 9)),
    ...extra,
  });
}

// The same work arriving as a new row every day — the Time by Task argument.
const codeReviewIds = [];
for (let i = 0; i < 8; i++) {
  const id = nextId('task-code');
  codeReviewIds.push(id);
  addTask({
    id,
    title: 'Code review',
    description: 'Review the open pull requests before stand-up.',
    status: 'done',
    quadrant: 'urgent-important',
    priority: 2,
    deadline: dayKey(i + 2),
    tags: ['engineering'],
    createdAt: iso(at(i + 2, 8, 40)),
    completedAt: iso(at(i + 2, 10, 5)),
    updatedAt: iso(at(i + 2, 10, 5)),
  });
}

const writingIds = [];
for (let i = 0; i < 6; i++) {
  const id = nextId('task-writing');
  writingIds.push(id);
  addTask({
    id,
    title: 'Deep work writing',
    description: 'Draft the launch note, one section at a time.',
    status: i === 0 ? 'in-progress' : 'done',
    quadrant: 'important',
    priority: 2,
    deadline: dayKey(i * 7 + 1),
    tags: ['writing'],
    createdAt: iso(at(i * 7 + 1, 9)),
    completedAt: i === 0 ? null : iso(at(i * 7 + 1, 12)),
    updatedAt: iso(at(i * 7 + 1, 12)),
  });
}

const current = {
  id: nextId('task-now'),
  title: 'Write the launch note',
  description: 'The three paragraphs that explain what changed in 3.0.',
  status: 'in-progress',
  quadrant: 'urgent-important',
  priority: 1,
  deadline: today,
  tags: ['writing', 'launch'],
  createdAt: iso(at(2, 9, 10)),
};
addTask({ ...current, todayOrder: 0, todayOrderDate: today });

addTask({
  id: nextId('task-sprint'),
  title: 'Sprint planning',
  description: 'Bring the three open questions and a recommendation for each.',
  quadrant: 'urgent-important',
  priority: 1,
  deadline: dayKey(-1),
  tags: ['team'],
  createdAt: iso(at(5, 16)),
});
addTask({
  id: nextId('task-design'),
  title: 'Design review — settings page',
  description: 'Card packing on a 1920 monitor, and the narrow column at 390.',
  status: 'in-progress',
  quadrant: 'important',
  priority: 2,
  deadline: dayKey(-2),
  tags: ['design'],
  createdAt: iso(at(9, 11)),
});
addTask({
  id: nextId('task-bank'),
  title: 'Call the bank about the transfer',
  quadrant: 'urgent',
  priority: 3,
  deadline: today,
  tags: ['admin'],
  createdAt: iso(at(1, 8, 30)),
});
addTask({
  id: nextId('task-update'),
  title: 'Fix the update check on a proxy',
  description: 'The GET to GitHub releases fails closed at the office.',
  quadrant: 'urgent',
  priority: 2,
  deadline: dayKey(1),
  tags: ['engineering', 'bug'],
  createdAt: iso(at(3, 14)),
});
addTask({
  id: nextId('task-okr'),
  title: 'Draft Q4 OKRs',
  description: 'Three objectives, at most three results each.',
  quadrant: 'important',
  priority: 3,
  deadline: dayKey(-6),
  tags: ['planning'],
  createdAt: iso(at(6, 10)),
});
addTask({
  id: nextId('task-read'),
  title: 'Read: Shape Up, chapter 4',
  quadrant: 'neither',
  priority: 4,
  tags: ['reading'],
  createdAt: iso(at(12, 21)),
});
addTask({
  id: nextId('task-inbox'),
  title: 'Inbox to zero',
  status: 'done',
  quadrant: 'urgent',
  priority: 3,
  tags: ['admin'],
  createdAt: iso(at(1, 8)),
  completedAt: iso(at(1, 9, 15)),
  updatedAt: iso(at(1, 9, 15)),
  todayOrder: 1,
});
addTask({
  id: nextId('task-slides'),
  title: 'Prepare the demo slides',
  description: 'Six slides, the live app on the last one.',
  status: 'in-progress',
  quadrant: 'urgent-important',
  priority: 1,
  deadline: dayKey(-1),
  tags: ['launch'],
  createdAt: iso(at(4, 15)),
  todayOrder: 2,
});
addTask({
  id: nextId('task-plants'),
  title: 'Water the plants',
  status: 'done',
  quadrant: 'neither',
  priority: 4,
  tags: ['home'],
  createdAt: iso(at(2, 19)),
  completedAt: iso(at(2, 19, 5)),
  updatedAt: iso(at(2, 19, 5)),
});

const sessions = [];

function addSession(title, taskId, daysAgo, hour, minute, minutes) {
  const start = at(daysAgo, hour, minute);
  const duration = minutes * 60;
  sessions.push({
    id: nextId('session'),
    taskId,
    taskTitle: title,
    type: 'work',
    durationPlanned: 1500,
    durationActual: duration,
    startedAt: iso(start),
    completedAt: iso(new Date(start.getTime() + duration * 1000)),
    interrupted: false,
  });
}

// Code review, every weekday for four months. Today is added below, so the
// dashboard's four sessions are the only ones on today's timeline.
let made = 0;
for (let d = 118; d >= 1; d--) {
  if (isWeekend(d)) continue;
  for (let k = 0; k < 2; k++) {
    addSession(
      'Code review',
      codeReviewIds[made % codeReviewIds.length],
      d,
      9 + k,
      k === 0 ? 15 : 45,
      19 + ((made + d) % 3),
    );
    made++;
  }
}

// Deep work writing, twice a week.
let written = 0;
for (let d = 110; d >= 0 && written < 54; d -= 3) {
  if (isWeekend(d)) continue;
  addSession(
    'Deep work writing',
    writingIds[written % writingIds.length],
    d,
    10,
    30,
    33 + (written % 5),
  );
  written++;
}

const sprintId = tasks.find((t) => t.title === 'Sprint planning')?.id ?? null;
for (let i = 0; i < 18; i++) {
  addSession('Sprint planning', sprintId, 112 - i * 6, 14, 0, 42);
}

const designId = tasks.find((t) => t.title === 'Design review — settings page')?.id ?? null;
for (let i = 0; i < 9; i++) {
  addSession('Design review — settings page', designId, 40 - i * 3, 16, 10, 37);
}

// Some time with no task, shown rather than hidden.
for (let i = 0; i < 7; i++) {
  addSession(null, null, 30 - i * 4, 18, 0, 17 + (i % 3));
}

// Today: four sessions, 2 h 05 m, so the hero callouts are the screenshot.
addSession('Code review', codeReviewIds[0], 0, 8, 40, 31);
addSession('Deep work writing', writingIds[0], 0, 9, 30, 31);
addSession('Code review', codeReviewIds[1], 0, 10, 30, 31);
addSession('Deep work writing', writingIds[1], 0, 11, 30, 32);

sessions.sort((a, b) => a.startedAt.localeCompare(b.startedAt));

const habits = [
  {
    id: 'habit-read',
    name: 'Read 20 pages',
    icon: '📖',
    targetFrequency: 'daily',
    createdAt: iso(at(90, 8)),
  },
  {
    id: 'habit-walk',
    name: 'Walk before work',
    icon: '🚶',
    targetFrequency: 'daily',
    createdAt: iso(at(90, 8)),
  },
  {
    id: 'habit-stretch',
    name: 'Stretch at 15:00',
    icon: '🧘',
    targetFrequency: 'daily',
    createdAt: iso(at(60, 8)),
  },
  {
    id: 'habit-nophone',
    name: 'No phone for the first hour',
    icon: '☀️',
    targetFrequency: 'daily',
    createdAt: iso(at(60, 8)),
  },
];

const habitEntries = [];
for (let d = 29; d >= 0; d--) {
  const day = at(d, 20);
  const weekend = isWeekend(d);
  if (!weekend || d % 2 === 0)
    habitEntries.push({ id: nextId('he'), habitId: 'habit-read', completedAt: iso(day) });
  if (!weekend && (d * 7) % 5 !== 0)
    habitEntries.push({ id: nextId('he'), habitId: 'habit-walk', completedAt: iso(day) });
  if (!weekend && d % 3 !== 0)
    habitEntries.push({ id: nextId('he'), habitId: 'habit-stretch', completedAt: iso(day) });
  if (d % 4 !== 0)
    habitEntries.push({ id: nextId('he'), habitId: 'habit-nophone', completedAt: iso(day) });
}

const journal = [
  {
    id: 'journal-1',
    date: dayKey(0),
    content:
      '<p>The launch note is nearly there. What kept slipping was the sentence about Time by Task: I kept writing it as a reporting feature when it is really a memory feature. It remembers what the hours were for, so I do not have to.</p><p>Two focus blocks before lunch, both on the same paragraph. Not fast, but it is the right paragraph now.</p>',
    createdAt: iso(at(0, 18, 40)),
    updatedAt: iso(at(0, 18, 40)),
  },
  {
    id: 'journal-2',
    date: dayKey(1),
    content:
      '<p>Reviewed eleven pull requests today. The Time by Task page says Code review is most of this month — the number is right, and it is also the thing I would not have guessed.</p>',
    createdAt: iso(at(1, 19, 5)),
    updatedAt: iso(at(1, 19, 5)),
  },
  {
    id: 'journal-3',
    date: dayKey(3),
    content:
      '<p>A quiet day. The standing reminder for the dentist did its job: asked twice while I was in a call, and was still there when I came out. Snoozed it ten minutes and then it was done.</p>',
    createdAt: iso(at(3, 17, 30)),
    updatedAt: iso(at(3, 17, 30)),
  },
  {
    id: 'journal-4',
    date: dayKey(5),
    content:
      '<p>Wrote for two hours without a single tab switch. The difference was starting from the outline instead of the blank page.</p>',
    createdAt: iso(at(5, 20, 10)),
    updatedAt: iso(at(5, 20, 10)),
  },
  {
    id: 'journal-5',
    date: dayKey(8),
    content:
      '<p>Settings page is finally not a strip in the middle of the monitor. Three cards on the laptop, four on the ultrawide, and the reading measure stays inside the card.</p>',
    createdAt: iso(at(8, 18)),
    updatedAt: iso(at(8, 18)),
  },
];

const waterIntake = [
  { id: nextId('water'), amountMl: 250, loggedAt: iso(at(0, 9, 40)) },
  { id: nextId('water'), amountMl: 250, loggedAt: iso(at(0, 11, 15)) },
  { id: nextId('water'), amountMl: 250, loggedAt: iso(at(0, 13, 20)) },
  { id: nextId('water'), amountMl: 250, loggedAt: iso(at(0, 15, 25)) },
];

function reminder(o) {
  return {
    id: o.id,
    title: o.title,
    note: o.note ?? '',
    dueAt: iso(o.dueAt),
    rhythm: o.rhythm,
    status: o.status,
    createdAt: iso(o.createdAt),
    fireCount: o.fireCount ?? 0,
    lastRangAt: o.lastRangAt ? iso(o.lastRangAt) : null,
    snoozes: o.snoozes ?? 0,
    finishedAt: o.finishedAt ? iso(o.finishedAt) : null,
  };
}

const futureReminders = [
  reminder({
    id: 'rem-dentist',
    title: 'Dentist — Dr. Rao',
    note: 'Clinic on the second floor',
    dueAt: at(-1, 10, 30),
    rhythm: 'steady',
    status: 'scheduled',
    createdAt: at(6, 9),
  }),
  reminder({
    id: 'rem-train',
    title: 'Train to Pune',
    note: 'Coach C2 · seat 41',
    dueAt: at(-3, 6, 40),
    rhythm: 'insistent',
    status: 'scheduled',
    createdAt: at(10, 9),
  }),
];

const standingReminders = [
  reminder({
    id: 'rem-presentation',
    title: 'Presentation — Room 4',
    note: 'Slides on the desktop · 15 minutes',
    dueAt: at(0, 14, 30),
    rhythm: 'insistent',
    status: 'standing',
    createdAt: at(1, 16, 20),
    fireCount: 3,
    lastRangAt: at(0, 14, 38),
  }),
  reminder({
    id: 'rem-vitamin',
    title: 'Take vitamin D',
    note: 'With lunch',
    dueAt: at(0, 15, 0),
    rhythm: 'gentle',
    status: 'standing',
    createdAt: at(2, 9),
    fireCount: 1,
    lastRangAt: at(0, 15, 0),
  }),
  reminder({
    id: 'rem-electricity',
    title: 'Pay the electricity bill',
    dueAt: at(1, 19, 0),
    rhythm: 'steady',
    status: 'done',
    createdAt: at(4, 9),
    fireCount: 2,
    lastRangAt: at(1, 19, 0),
    finishedAt: at(1, 19, 5),
  }),
  reminder({
    id: 'rem-library',
    title: 'Return the library books',
    dueAt: at(2, 17, 0),
    rhythm: 'gentle',
    status: 'stopped',
    createdAt: at(7, 9),
    fireCount: 4,
    lastRangAt: at(2, 17, 0),
    finishedAt: at(2, 18, 20),
  }),
];

const timerState = {
  isRunning: false,
  type: 'work',
  remainingSeconds: 1500,
  taskId: current.id,
  sessionCount: 4,
  startedAt: null,
  lastActiveDate: today,
};

function buildDemo({ standing = false, timer = null } = {}) {
  return {
    deepwork_settings: settings,
    deepwork_tasks: tasks,
    deepwork_sessions: sessions,
    deepwork_habits: habits,
    deepwork_habitEntries: habitEntries,
    deepwork_journal: journal,
    deepwork_waterIntake: waterIntake,
    deepwork_timerState: timer ? { ...timerState, ...timer } : timerState,
    'deepwork.standingReminders.v1': standing ? standingReminders : futureReminders,
  };
}

module.exports = { buildDemo };
