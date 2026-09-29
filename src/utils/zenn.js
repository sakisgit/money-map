/**
 * Zenn — the Money Map in-app assistant.
 *
 * Zenn runs entirely in the browser: it matches the question against a list of
 * intents and answers from the user's own data. Nothing is sent anywhere.
 *
 * It understands time periods ("in August", "last month", "this week",
 * "2025", "all time"), tolerates small typos, and remembers the last topic so
 * a follow-up like "and July?" works.
 */

import { formatDateKeyDisplay, formatMonthKey, toLocalDateKey } from "./dateKey";

// Non-breaking spaces keep "96.00 €" and "8.00 h" on one line.
const money = (value, formatMoney) => `${formatMoney(Number(value) || 0)}\u00a0€`;
const hours = (value) => `${(Number(value) || 0).toFixed(2)}\u00a0h`;
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/* ------------------------------------------------------------------------ */
/* Periods                                                                  */
/* ------------------------------------------------------------------------ */

const MONTHS = [
  ["january", "jan", "ιανουαριος", "ιαν"],
  ["february", "feb", "φεβρουαριος", "φεβ"],
  ["march", "mar", "μαρτιος", "μαρ"],
  ["april", "apr", "απριλιος", "απρ"],
  ["may", "μαιος", "μαι"],
  ["june", "jun", "ιουνιος", "ιουν"],
  ["july", "jul", "ιουλιος", "ιουλ"],
  ["august", "aug", "αυγουστος", "αυγ"],
  ["september", "sep", "sept", "σεπτεμβριος", "σεπ"],
  ["october", "oct", "οκτωβριος", "οκτ"],
  ["november", "nov", "νοεμβριος", "νοε"],
  ["december", "dec", "δεκεμβριος", "δεκ"],
];

const pad = (n) => String(n).padStart(2, "0");
const monthRange = (year, monthIndex) => ({
  from: `${year}-${pad(monthIndex + 1)}-01`,
  to: toLocalDateKey(new Date(year, monthIndex + 1, 0)),
});

/**
 * Finds a time period in the question. Returns
 * { label, from, to } (inclusive YYYY-MM-DD bounds; null bound = open), or null.
 */
export const parsePeriod = (text, today = new Date()) => {
  const y = today.getFullYear();
  const m = today.getMonth();
  const has = (re) => re.test(text);

  if (has(/\b(all time|ever|overall|since the start|in total|so far)\b/))
    return { label: "all time", from: null, to: null, kind: "all" };

  if (has(/\btoday\b/)) {
    const key = toLocalDateKey(today);
    return { label: "today", from: key, to: key, kind: "day" };
  }
  if (has(/\byesterday\b/)) {
    const key = toLocalDateKey(new Date(y, m, today.getDate() - 1));
    return { label: "yesterday", from: key, to: key, kind: "day" };
  }

  const weekStart = new Date(y, m, today.getDate() - ((today.getDay() + 6) % 7));
  if (has(/\b(this week)\b/)) {
    return {
      label: "this week",
      from: toLocalDateKey(weekStart),
      to: toLocalDateKey(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6)),
      kind: "week",
    };
  }
  if (has(/\b(last week|previous week)\b/)) {
    const start = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() - 7);
    return {
      label: "last week",
      from: toLocalDateKey(start),
      to: toLocalDateKey(new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6)),
      kind: "week",
    };
  }

  if (has(/\b(this month|current month)\b/))
    return { label: formatMonthKey(`${y}-${pad(m + 1)}`), ...monthRange(y, m), kind: "month", monthKey: `${y}-${pad(m + 1)}` };
  if (has(/\b(last month|previous month)\b/)) {
    const d = new Date(y, m - 1, 1);
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    return { label: formatMonthKey(key), ...monthRange(d.getFullYear(), d.getMonth()), kind: "month", monthKey: key };
  }
  if (has(/\bnext month\b/)) {
    const d = new Date(y, m + 1, 1);
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    return { label: formatMonthKey(key), ...monthRange(d.getFullYear(), d.getMonth()), kind: "month", monthKey: key };
  }

  const yearMatch = text.match(/\b(20\d{2})\b/);
  const tokens = text.split(" ");
  const monthIndex = MONTHS.findIndex((names) =>
    // "may" is also a verb, so only count it next to a year or "in"/"for".
    names.some((name) =>
      name === "may"
        ? /\b(in|for|of|during) may\b|\bmay 20\d{2}\b/.test(text)
        : tokens.includes(name)
    )
  );

  if (monthIndex >= 0) {
    // No year given: the most recent such month (this year, or last year if
    // it has not happened yet).
    const year = yearMatch ? Number(yearMatch[1]) : monthIndex > m ? y - 1 : y;
    const key = `${year}-${pad(monthIndex + 1)}`;
    return { label: formatMonthKey(key), ...monthRange(year, monthIndex), kind: "month", monthKey: key };
  }

  if (has(/\b(this year|current year)\b/))
    return { label: String(y), from: `${y}-01-01`, to: `${y}-12-31`, kind: "year" };
  if (has(/\b(last year|previous year)\b/))
    return { label: String(y - 1), from: `${y - 1}-01-01`, to: `${y - 1}-12-31`, kind: "year" };
  if (yearMatch) {
    const year = yearMatch[1];
    return { label: year, from: `${year}-01-01`, to: `${year}-12-31`, kind: "year" };
  }

  return null;
};

const inPeriod = (dateKey, period) => {
  if (!period) return true;
  if (!dateKey) return false;
  if (period.from && dateKey < period.from) return false;
  if (period.to && dateKey > period.to) return false;
  return true;
};

/* ------------------------------------------------------------------------ */
/* Snapshot                                                                  */
/* ------------------------------------------------------------------------ */

/** Builds the data Zenn talks about from the app context. */
export const buildZennSnapshot = (ctx) => {
  const income = Array.isArray(ctx?.incomeItems) ? ctx.incomeItems : [];
  const loss = Array.isArray(ctx?.lossItems) ? ctx.lossItems : [];
  const workMonths = ctx?.workMonths && typeof ctx.workMonths === "object" ? ctx.workMonths : {};

  // Every shift and marked day ever recorded (saved history + live data).
  const allShifts = Object.values(workMonths).flatMap((month) => month.hours || []);
  const allDays = Object.assign({}, ...Object.values(workMonths).map((month) => month.workDayStatus || {}));

  return {
    payment: Number(ctx?.payment) || 0,
    income,
    loss,
    workMonths,
    allShifts,
    allDays,
    unpaidEarnings: Number(ctx?.workHoursTotalEarnings) || 0,
    rate: Number(ctx?.rateInput) || 0,
    today: new Date(),
  };
};

const amount = (item) => Number(item?.amount) || 0;
const sum = (list, pick) => list.reduce((total, item) => total + pick(item), 0);

const moneyFor = (s, period) => {
  // Entries without a date only count when no period is asked for.
  const income = s.income.filter((i) => inPeriod(i?.dateKey, period));
  const loss = s.loss.filter((i) => inPeriod(i?.dateKey, period));
  const totalIncome = sum(income, amount);
  const totalLoss = sum(loss, amount);
  const byMethod = (method) =>
    sum(loss.filter((i) => (i?.paymentMethod || "cash") === method), amount);
  const biggest = (list) =>
    list.reduce((best, item) => (amount(item) > amount(best) ? item : best), null);
  return {
    income,
    loss,
    totalIncome,
    totalLoss,
    cash: byMethod("cash"),
    card: byMethod("card"),
    biggestExpense: biggest(loss),
    biggestIncome: biggest(income),
  };
};

const workFor = (s, period) => {
  const shifts = s.allShifts.filter((e) => inPeriod(e?.dateKey, period));
  const days = Object.entries(s.allDays).filter(([dateKey]) => inPeriod(dateKey, period));
  const totalHours = sum(shifts, (e) => Number(e?.hours) || 0);
  const earnings = sum(shifts, (e) => (Number(e?.hours) || 0) * (Number(e?.rate) || 0));
  const count = (status) => days.filter(([, st]) => st === status).length;
  return {
    shifts,
    shiftCount: shifts.length,
    workedDays: new Set(shifts.filter((e) => !e.paidVacation).map((e) => e.dateKey)).size,
    totalHours,
    earnings,
    averageRate: totalHours > 0 ? earnings / totalHours : 0,
    daysOff: count("off"),
    vacationDays: count("vacation"),
    holidays: count("holiday"),
  };
};

const periodWord = (period) =>
  !period
    ? "so far"
    : period.kind === "all"
      ? "overall"
      : period.kind === "day" || period.kind === "week"
        ? period.label
        : `in ${period.label}`;

/* ------------------------------------------------------------------------ */
/* Intents                                                                   */
/* ------------------------------------------------------------------------ */

const WORK_LINK = { label: "Open Work Hours", to: "/work-hours", icon: "fa-clock" };
const STATS_LINK = { label: "Open All Stats", to: "/stats", icon: "fa-chart-pie" };
const HOME_LINK = { label: "Go to Home", to: "/", icon: "fa-house" };

/**
 * phrases: multi-word matches (strong). words: single words, typo-tolerant.
 * usesPeriod: the reply changes with a time period, so a bare period
 * follow-up ("and July?") can reuse this intent.
 */
const INTENTS = [
  {
    id: "greeting",
    icon: "fa-hand",
    phrases: ["good morning", "good evening", "good afternoon"],
    words: ["hello", "hi", "hey", "yassou", "geia", "γεια", "καλημερα"],
    reply: () => ({
      text: "Hey! I'm Zenn. Ask me about your balance, spending, work hours or days off — for any month. You can also just type one word, like \"hours\" or \"August\".",
    }),
    next: ["summary", "balance", "hours"],
  },
  {
    id: "help",
    icon: "fa-circle-question",
    phrases: ["what can you do", "help me", "what can i ask", "how do you work"],
    words: ["help", "commands", "βοηθεια"],
    reply: () => ({
      text: [
        "Here's what I can answer:",
        "• Money: balance, spending, income, biggest expense, cash vs card",
        "• Work: hours, earnings, days worked, rest days, vacations, holidays",
        "• Time: add a period to any question — \"in August\", \"last month\", \"this week\", \"2026\", \"all time\"",
        "• Planning: upcoming days off, your best month",
        "• How-tos: logging hours, adding expenses, setting payment",
      ].join("\n"),
    }),
    next: ["summary", "upcoming", "best"],
  },
  {
    id: "about",
    icon: "fa-map",
    phrases: ["what is money map", "what is this app", "what does this app do", "about the app", "who are you", "what are you"],
    words: [],
    reply: () => ({
      text: "Money Map tracks the money you earn and spend each month, plus the hours you work, your days off, vacations and holidays. Every month is saved, so you can look back at any of them on the calendar or on All Stats.",
      actions: [STATS_LINK],
    }),
    next: ["help", "summary"],
  },
  {
    id: "summary",
    icon: "fa-calendar-check",
    usesPeriod: true,
    phrases: ["what did i do", "how was", "overview", "sum up", "recap", "how did i do"],
    words: ["summary", "overview", "recap", "report"],
    reply: (s, f, period) => {
      const p = period ?? parsePeriod("this month", s.today);
      const w = workFor(s, p);
      const mo = moneyFor(s, p);
      const nothing = w.shiftCount === 0 && w.daysOff + w.vacationDays + w.holidays === 0 && mo.income.length + mo.loss.length === 0;
      if (nothing)
        return { text: `I have nothing recorded for ${p.label}. Pick another month on the calendar or ask about "all time".`, actions: [STATS_LINK] };
      return {
        text: [
          `Here's ${p.label}:`,
          `• Worked ${hours(w.totalHours)} over ${plural(w.workedDays, "day")} (${plural(w.shiftCount, "shift")}) — ${money(w.earnings, f)}`,
          `• Rest ${w.daysOff} · Vacation ${w.vacationDays} · Holidays ${w.holidays}`,
          `• Expenses ${money(mo.totalLoss, f)} · Extra income ${money(mo.totalIncome, f)}`,
        ].join("\n"),
        actions: [STATS_LINK],
      };
    },
    next: ["hours", "spent", "best"],
  },
  {
    id: "balance",
    icon: "fa-scale-balanced",
    phrases: ["how much is left", "how much do i have", "left to spend", "money left", "net balance"],
    words: ["balance", "remaining", "left", "net", "υπολοιπο"],
    reply: (s, f) => {
      const mo = moneyFor(s, null);
      if (s.payment === 0 && mo.totalIncome === 0)
        return { text: "You haven't set a monthly income yet. Tap Set Payment on the home page and I'll track what's left.", actions: [HOME_LINK] };
      const balance = s.payment + mo.totalIncome - mo.totalLoss;
      const spentPct = s.payment > 0 ? (mo.totalLoss / s.payment) * 100 : 0;
      const tone = balance < 0 ? "You're over budget." : balance === 0 ? "You're exactly at zero." : "You're still in the green.";
      return {
        text: [
          `${tone} Net balance: ${money(balance, f)}`,
          `• Monthly income ${money(s.payment, f)} + extra ${money(mo.totalIncome, f)}`,
          `• Expenses ${money(mo.totalLoss, f)}${s.payment > 0 ? ` (${spentPct.toFixed(0)}% of income)` : ""}`,
        ].join("\n"),
      };
    },
    next: ["spent", "biggest", "cashcard"],
  },
  {
    id: "spent",
    icon: "fa-arrow-trend-down",
    usesPeriod: true,
    phrases: ["how much have i spent", "how much did i spend", "total spent", "total expenses"],
    words: ["expenses", "expense", "spending", "spent", "spend", "costs", "εξοδα"],
    reply: (s, f, period) => {
      const mo = moneyFor(s, period);
      if (mo.loss.length === 0)
        return { text: `No expenses ${periodWord(period)}. Add one from the home page and I'll keep the totals.`, actions: [HOME_LINK] };
      return {
        text: `You spent ${money(mo.totalLoss, f)} ${periodWord(period)} across ${plural(mo.loss.length, "entry", "entries")} — about ${money(mo.totalLoss / mo.loss.length, f)} each.`,
      };
    },
    next: ["biggest", "cashcard", "balance"],
  },
  {
    id: "income",
    icon: "fa-arrow-trend-up",
    usesPeriod: true,
    phrases: ["how much did i earn", "monthly income", "extra income"],
    words: ["income", "salary", "payment", "εσοδα", "μισθος"],
    reply: (s, f, period) => {
      const mo = moneyFor(s, period);
      return {
        text: `Your monthly income is set to ${money(s.payment, f)}. Extra income ${periodWord(period)}: ${money(mo.totalIncome, f)} across ${plural(mo.income.length, "entry", "entries")}.`,
      };
    },
    next: ["earnings", "balance"],
  },
  {
    id: "biggest",
    icon: "fa-fire",
    usesPeriod: true,
    phrases: ["biggest expense", "largest expense", "most expensive", "biggest cost", "biggest income", "largest income"],
    words: ["biggest", "largest", "highest"],
    reply: (s, f, period) => {
      const mo = moneyFor(s, period);
      const parts = [];
      if (mo.biggestExpense)
        parts.push(`• Biggest expense: ${money(mo.biggestExpense.amount, f)}${mo.biggestExpense.text ? ` for "${mo.biggestExpense.text}"` : ""}`);
      if (mo.biggestIncome)
        parts.push(`• Biggest income: ${money(mo.biggestIncome.amount, f)}${mo.biggestIncome.text ? ` from "${mo.biggestIncome.text}"` : ""}`);
      return parts.length
        ? { text: [`Top entries ${periodWord(period)}:`, ...parts].join("\n") }
        : { text: `No entries ${periodWord(period)} to compare yet.`, actions: [HOME_LINK] };
    },
    next: ["spent", "cashcard"],
  },
  {
    id: "cashcard",
    icon: "fa-credit-card",
    usesPeriod: true,
    phrases: ["cash or card", "payment method", "cash vs card"],
    words: ["cash", "card", "κάρτα", "μετρητα"],
    reply: (s, f, period) => {
      const mo = moneyFor(s, period);
      if (mo.totalLoss === 0)
        return { text: `No expenses ${periodWord(period)}, so there's no cash-versus-card split to show.` };
      const cashShare = (mo.cash / mo.totalLoss) * 100;
      return {
        text: `${periodWord(period).replace(/^./, (c) => c.toUpperCase())} you paid ${money(mo.cash, f)} in cash (${cashShare.toFixed(0)}%) and ${money(mo.card, f)} by card (${(100 - cashShare).toFixed(0)}%).`,
      };
    },
    next: ["spent", "biggest"],
  },
  {
    id: "hours",
    icon: "fa-hourglass-half",
    usesPeriod: true,
    phrases: ["how many hours", "hours worked", "work hours", "total hours", "did i work", "days worked"],
    words: ["hours", "hour", "hrs", "shifts", "shift", "worked", "work", "ωρες", "βαρδιες"],
    reply: (s, f, period) => {
      const p = period ?? parsePeriod("this month", s.today);
      const w = workFor(s, p);
      const all = workFor(s, null);
      if (w.shiftCount === 0) {
        const tail = all.shiftCount > 0 ? ` All time you've logged ${hours(all.totalHours)}.` : "";
        return { text: `No shifts logged ${periodWord(p)}.${tail}`, actions: [WORK_LINK] };
      }
      const lines = [
        `${p.label.replace(/^./, (c) => c.toUpperCase())}: ${hours(w.totalHours)} over ${plural(w.workedDays, "day")} (${plural(w.shiftCount, "shift")})`,
        `• Average shift ${hours(w.totalHours / w.shiftCount)} · Earned ${money(w.earnings, f)}`,
      ];
      if (!period && all.totalHours > w.totalHours) lines.push(`• All time: ${hours(all.totalHours)}`);
      return { text: lines.join("\n"), actions: [STATS_LINK] };
    },
    next: ["earnings", "daysoff", "best"],
  },
  {
    id: "earnings",
    icon: "fa-euro-sign",
    usesPeriod: true,
    phrases: ["how much have i made", "hourly rate", "made from work", "how much did i make"],
    words: ["earnings", "earned", "earn", "rate", "paid", "made", "κερδη"],
    reply: (s, f, period) => {
      const p = period ?? parsePeriod("this month", s.today);
      const w = workFor(s, p);
      const lines = [
        w.shiftCount
          ? `You earned ${money(w.earnings, f)} from work ${periodWord(p)} (${hours(w.totalHours)} at ${money(w.averageRate, f)}/h on average).`
          : `No work earnings ${periodWord(p)}.`,
      ];
      if (s.unpaidEarnings > 0) lines.push(`• Not yet applied as payment: ${money(s.unpaidEarnings, f)}`);
      if (s.rate > 0) lines.push(`• Your current hourly rate: ${money(s.rate, f)}`);
      return { text: lines.join("\n"), actions: w.shiftCount ? [STATS_LINK] : [WORK_LINK] };
    },
    next: ["hours", "best", "payment"],
  },
  {
    id: "daysoff",
    icon: "fa-umbrella-beach",
    usesPeriod: true,
    phrases: ["days off", "day off", "rest day", "rest days", "time off"],
    words: ["vacation", "vacations", "holiday", "holidays", "rest", "off", "leave", "αδεια", "διακοπες", "ρεπο", "αργια"],
    reply: (s, f, period) => {
      const p = period ?? parsePeriod("this month", s.today);
      const w = workFor(s, p);
      return {
        text: [
          `Non-working days ${periodWord(p)}:`,
          `• Rest days: ${w.daysOff}`,
          `• Vacation days: ${w.vacationDays}`,
          `• Holidays: ${w.holidays}`,
          "Tip: on the calendar, tap a day → Cancel marks Rest; tap again for Vacation, then Holiday.",
        ].join("\n"),
      };
    },
    next: ["upcoming", "hours"],
  },
  {
    id: "upcoming",
    icon: "fa-plane-departure",
    phrases: ["next vacation", "next holiday", "upcoming", "coming up", "planned days", "next day off"],
    words: ["upcoming", "planned", "plans"],
    reply: (s) => {
      const todayKey = toLocalDateKey(s.today);
      const LABEL = { off: "Rest day", vacation: "Vacation", holiday: "Holiday" };
      const ahead = Object.entries(s.allDays)
        .filter(([dateKey, status]) => dateKey >= todayKey && LABEL[status])
        .sort(([a], [b]) => a.localeCompare(b));
      if (ahead.length === 0)
        return { text: "Nothing planned yet. Open a future month on the calendar and tap days to mark rest, vacation or holidays." };
      const lines = ahead.slice(0, 5).map(([dateKey, status]) => `• ${formatDateKeyDisplay(dateKey)} — ${LABEL[status]}`);
      if (ahead.length > 5) lines.push(`…and ${ahead.length - 5} more.`);
      return { text: [`Coming up (${plural(ahead.length, "day")}):`, ...lines].join("\n") };
    },
    next: ["daysoff", "summary"],
  },
  {
    id: "best",
    icon: "fa-trophy",
    phrases: ["best month", "busiest month", "most hours", "top month", "worst month", "compare months"],
    words: ["best", "busiest", "compare", "record"],
    reply: (s, f) => {
      const months = Object.values(s.workMonths).filter((m) => m.shifts > 0);
      if (months.length === 0) return { text: "Log some shifts first and I'll rank your months.", actions: [WORK_LINK] };
      const byHours = [...months].sort((a, b) => b.totalHours - a.totalHours);
      const top = byHours[0];
      const lines = [`Your busiest month was ${formatMonthKey(top.monthKey)}: ${hours(top.totalHours)}, ${money(top.earnings, f)}.`];
      if (byHours.length > 1) {
        const low = byHours[byHours.length - 1];
        lines.push(`• Quietest: ${formatMonthKey(low.monthKey)} with ${hours(low.totalHours)}`);
        const avg = byHours.reduce((t, m) => t + m.totalHours, 0) / byHours.length;
        lines.push(`• Average across ${plural(byHours.length, "month")}: ${hours(avg)}`);
      }
      return { text: lines.join("\n"), actions: [STATS_LINK] };
    },
    next: ["summary", "hours"],
  },
  {
    id: "history",
    icon: "fa-clock-rotate-left",
    phrases: ["past months", "saved months", "old months", "past hours", "previous months"],
    words: ["history", "archive", "ιστορικο"],
    reply: (s, f) => {
      const months = Object.values(s.workMonths)
        .filter((m) => m.monthKey <= toLocalDateKey(s.today).slice(0, 7))
        .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
        .slice(0, 4);
      if (months.length === 0) return { text: "No months recorded yet. Every month is saved automatically as you use the app." };
      return {
        text: [
          "Your latest months:",
          ...months.map((m) => `• ${formatMonthKey(m.monthKey)}: ${hours(m.totalHours)}, ${money(m.earnings, f)}, ${m.daysOff} rest · ${m.vacationDays} vacation · ${m.holidays || 0} holidays`),
        ].join("\n"),
        actions: [STATS_LINK],
      };
    },
    next: ["best", "summary"],
  },
  {
    id: "howto-expense",
    icon: "fa-receipt",
    phrases: ["add an expense", "add expense", "log expense", "record spending", "add income", "add money"],
    words: [],
    reply: () => ({
      text: "On the home page, open Add Expense or Add Income, type a name and an amount, choose cash or card, then save. The totals update straight away.",
      actions: [HOME_LINK],
    }),
    next: ["spent", "balance"],
  },
  {
    id: "howto-hours",
    icon: "fa-calendar-plus",
    phrases: ["log hours", "add hours", "add a shift", "log a shift", "record hours", "how do i add work", "how do i log"],
    words: [],
    reply: () => ({
      text: "Go to Work Hours, set your hourly rate once, then add a shift with its start and end time. Or tap an empty day on the home calendar for a quick shift.",
      actions: [WORK_LINK],
    }),
    next: ["hours", "daysoff"],
  },
  {
    id: "payment",
    icon: "fa-money-check-dollar",
    phrases: ["set payment", "set my income", "change salary", "monthly budget", "set budget", "apply hours"],
    words: ["budget"],
    reply: () => ({
      text: "Tap Set Payment on the home page. Type an amount, or apply the earnings from the hours you logged. Applying clears those hours from the Work Hours list, but the calendar and All Stats keep them.",
      actions: [HOME_LINK],
    }),
    next: ["earnings", "balance"],
  },
  {
    id: "howto-reset",
    icon: "fa-rotate",
    phrases: ["new month", "start over", "delete everything"],
    words: ["reset", "clear"],
    reply: () => ({
      text: "Reset Stats on the home page clears your expenses, income and monthly payment. It asks for confirmation first and can't be undone. Your work calendar history is not touched.",
    }),
    next: ["balance"],
  },
  {
    id: "privacy",
    icon: "fa-shield-halved",
    phrases: ["is my data safe", "where is my data", "sign up"],
    words: ["privacy", "private", "cloud", "account", "login", "safe"],
    reply: () => ({
      text: "There's no account and no server. Everything is saved in this browser, so your data stays on this device — clearing your browser data clears it too.",
    }),
    next: ["help"],
  },
  {
    id: "theme",
    icon: "fa-moon",
    phrases: ["dark mode", "light mode", "night mode"],
    words: ["theme", "dark", "light"],
    reply: () => ({ text: "Open the settings menu (gear icon) in the header and use the theme switch. Money Map remembers your choice." }),
    next: ["help"],
  },
  {
    id: "contact",
    icon: "fa-envelope",
    phrases: ["report a problem"],
    words: ["contact", "email", "support", "bug", "feedback", "suggestion"],
    reply: () => ({
      text: "The Contact page has a form that emails the developer directly — great for bugs, ideas or feedback.",
      actions: [{ label: "Open Contact", to: "/contact", icon: "fa-envelope" }],
    }),
    next: ["help"],
  },
  {
    id: "thanks",
    icon: "fa-heart",
    phrases: ["thank you"],
    words: ["thanks", "thx", "cheers", "nice", "great", "efharisto", "ευχαριστω"],
    reply: () => ({ text: "Any time! Ask me whenever you want a number or a quick how-to." }),
    next: ["summary", "upcoming"],
  },
];

const INTENT_BY_ID = Object.fromEntries(INTENTS.map((intent) => [intent.id, intent]));

/** Follow-up chips per intent: label shown + question sent. */
const SUGGESTION_TEXT = {
  summary: "Summary of this month",
  balance: "How much is left?",
  spent: "How much did I spend this month?",
  biggest: "Biggest expense",
  cashcard: "Cash or card?",
  hours: "Hours this month",
  earnings: "Earnings this month",
  daysoff: "Days off this month",
  upcoming: "Upcoming days off",
  best: "My best month",
  history: "Past months",
  payment: "How do I set payment?",
  help: "What can you do?",
  "howto-hours": "How do I log hours?",
  "howto-expense": "How do I add an expense?",
  income: "My income",
  privacy: "Is my data safe?",
  theme: "How do I switch theme?",
  contact: "How do I contact support?",
};

const toSuggestion = (id) =>
  SUGGESTION_TEXT[id] ? { text: SUGGESTION_TEXT[id], icon: INTENT_BY_ID[id]?.icon || "fa-comment" } : null;

export const ZENN_SUGGESTIONS = ["summary", "balance", "hours", "upcoming", "best", "help"]
  .map(toSuggestion)
  .filter(Boolean);

/* ------------------------------------------------------------------------ */
/* Matching                                                                  */
/* ------------------------------------------------------------------------ */

const normalize = (text) =>
  String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents (Greek tonos too)
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Edit distance, capped: only used to forgive a one-letter typo. */
const withinOneEdit = (a, b) => {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i += 1;
      j += 1;
      continue;
    }
    edits += 1;
    if (edits > 1) return false;
    if (a.length > b.length) i += 1;
    else if (b.length > a.length) j += 1;
    else {
      i += 1;
      j += 1;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
};

const scoreIntent = (intent, text, tokens) => {
  let score = 0;
  for (const phrase of intent.phrases) {
    const key = normalize(phrase);
    if (key && ` ${text} `.includes(` ${key} `)) score = Math.max(score, 10 + key.length);
  }
  for (const word of intent.words) {
    const key = normalize(word);
    if (!key) continue;
    if (tokens.includes(key)) score += 6;
    else if (key.length >= 5 && tokens.some((t) => t.length >= 4 && withinOneEdit(t, key))) score += 4;
  }
  return score;
};

const pick = (variants) => variants[Math.floor(Math.random() * variants.length)];

/** Edit distance where a swapped pair of letters counts as one typo. */
const typoDistance = (a, b) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
};

// Words that say nothing about the topic, so they must not drive a guess.
const FILLER = new Set(
  "what whats how does did can could would the this that for and you your are was were with about tell show give want know much many have has get some any please".split(" ")
);

/**
 * Loose second pass when nothing matched: word starts ("vac" → vacation) and
 * bigger typos ("erninsg" → earnings, "mony" → money).
 * Returns up to 3 intent ids that have a ready-made question.
 */
const guessIntents = (tokens) => {
  const useful = tokens.filter((t) => t.length >= 3 && !FILLER.has(t));
  if (useful.length === 0) return [];

  const scored = INTENTS.filter((intent) => SUGGESTION_TEXT[intent.id])
    .map((intent) => {
      const vocab = [
        ...intent.words.map(normalize),
        ...intent.phrases.flatMap((phrase) => normalize(phrase).split(" ")),
      ].filter((w) => w.length >= 4 && !FILLER.has(w));
      let score = 0;
      for (const token of useful) {
        const allowed = token.length >= 6 ? 2 : token.length >= 4 ? 1 : 0;
        if (vocab.some((w) => w.startsWith(token) || token.startsWith(w))) score += 2;
        else if (allowed && vocab.some((w) => Math.abs(w.length - token.length) <= allowed && typoDistance(token, w) <= allowed)) score += 1;
      }
      return { id: intent.id, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((entry) => entry.id);
};

/**
 * Answers a question. `lastIntentId` is the previous topic, so a follow-up
 * that only names a period ("and July?") reuses it.
 * Returns { text, icon, intent, actions, suggestions }.
 */
export const askZenn = (question, snapshot, formatMoney, lastIntentId = null) => {
  const text = normalize(question);
  const tokens = text.split(" ").filter(Boolean);
  const period = text ? parsePeriod(text, snapshot.today) : null;

  let best = null;
  let bestScore = 0;
  for (const intent of INTENTS) {
    const score = scoreIntent(intent, text, tokens);
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }

  // Only a period ("and July?"): keep talking about the previous topic.
  if (!best && period) {
    const previous = INTENT_BY_ID[lastIntentId];
    best = previous?.usesPeriod ? previous : INTENT_BY_ID.summary;
  }

  if (!best) {
    const guesses = guessIntents(tokens);
    const quoted = question.trim().length > 40 ? "that" : `"${question.trim()}"`;
    const text = guesses.length
      ? pick([
          `Hmm, I'm not sure what you mean by ${quoted}. Did you mean:`,
          `I didn't quite get ${quoted}. Maybe one of these?`,
          `Not sure I follow — were you asking about one of these?`,
        ])
      : pick([
          "That's outside what I know — I only see your Money Map data. I can help with things like:",
          "I can't answer that one, but here's what I'm good at:",
          "I don't have an answer for that. Try one of these instead:",
        ]);
    const options = (guesses.length ? guesses : ["summary", "balance", "hours"])
      .map(toSuggestion)
      .filter(Boolean);
    return {
      text,
      icon: "fa-circle-question",
      intent: null,
      actions: [],
      options,
      suggestions: ZENN_SUGGESTIONS,
    };
  }

  const result = best.reply(snapshot, formatMoney, period);
  const suggestions = (best.next || [])
    .map(toSuggestion)
    .filter(Boolean)
    .slice(0, 3);

  return {
    text: result.text,
    icon: best.icon,
    intent: best.id,
    actions: result.actions || [],
    suggestions: suggestions.length ? suggestions : ZENN_SUGGESTIONS,
  };
};
