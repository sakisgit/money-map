/**
 * Zenn — the Money Map in-app assistant.
 *
 * Zenn runs entirely in the browser: it matches the question against a list of
 * intents and answers from the user's own live data. Nothing is sent anywhere.
 */

const money = (value, formatMoney) => `${formatMoney(Number(value) || 0)} €`;
const hours = (value) => `${(Number(value) || 0).toFixed(2)} h`;

/** Builds the numbers Zenn talks about from the live app context. */
export const buildZennSnapshot = (ctx) => {
  const income = Array.isArray(ctx?.incomeItems) ? ctx.incomeItems : [];
  const loss = Array.isArray(ctx?.lossItems) ? ctx.lossItems : [];
  const shifts = Array.isArray(ctx?.hoursList) ? ctx.hoursList : [];
  const amount = (item) => Number(item?.amount) || 0;
  const sum = (list, pick) => list.reduce((total, item) => total + pick(item), 0);

  const payment = Number(ctx?.payment) || 0;
  const totalIncome = sum(income, amount);
  const totalLoss = sum(loss, amount);
  const totalHours = sum(shifts, (item) => Number(item?.hours) || 0);
  const earnings = Number(ctx?.workHoursTotalEarnings) || 0;
  const statuses = Object.values(ctx?.workDayStatus || {});

  const biggest = (list) =>
    list.reduce((best, item) => (amount(item) > amount(best) ? item : best), null);
  const byMethod = (list, method) =>
    sum(
      list.filter((item) => (item?.paymentMethod || "cash") === method),
      amount
    );

  return {
    payment,
    totalIncome,
    totalLoss,
    balance: payment + totalIncome - totalLoss,
    spentPercent: payment > 0 ? Math.min((totalLoss / payment) * 100, 100) : 0,
    expenseCount: loss.length,
    incomeCount: income.length,
    averageExpense: loss.length ? totalLoss / loss.length : 0,
    biggestExpense: biggest(loss),
    biggestIncome: biggest(income),
    cash: byMethod(loss, "cash"),
    card: byMethod(loss, "card"),
    shiftCount: shifts.length,
    totalHours,
    earnings,
    averageRate: totalHours > 0 ? earnings / totalHours : 0,
    daysOff: statuses.filter((s) => s === "off").length,
    vacationDays: statuses.filter((s) => s === "vacation").length,
    archivedMonths: Array.isArray(ctx?.archivedMonths) ? ctx.archivedMonths : [],
  };
};

/**
 * Each intent has keywords (any match scores) and a reply built from the
 * snapshot. Longer keyword matches win, so specific questions beat generic ones.
 */
const INTENTS = [
  {
    id: "greeting",
    keywords: ["hello", "hi", "hey", "good morning", "good evening", "yassou", "geia"],
    reply: () =>
      "Hey! I'm Zenn, your Money Map assistant. Ask me about your balance, your spending, your work hours — or how any part of the app works.",
  },
  {
    id: "about",
    keywords: ["what is money map", "what is this app", "what does this app do", "about the app", "what can you do", "help me", "who are you", "what are you"],
    reply: () =>
      "Money Map tracks the money you earn and spend each month, plus the hours you work. I can tell you your balance, how much you have spent, what your biggest expense was, how many hours you logged, and how to use any page. Try: \"how much is left?\"",
  },
  {
    id: "balance",
    keywords: ["balance", "how much is left", "how much do i have", "remaining", "left to spend", "net"],
    reply: (s, f) => {
      if (s.payment === 0 && s.totalIncome === 0)
        return "You have not set a monthly income yet. Tap Set Payment on the home page and I can start tracking what is left.";
      const tone =
        s.balance < 0
          ? "You are over budget."
          : s.balance === 0
          ? "You are exactly at zero."
          : "You are still in the green.";
      return `${tone} Your net balance is ${money(s.balance, f)} — that is ${money(
        s.payment,
        f
      )} monthly income plus ${money(s.totalIncome, f)} extra income, minus ${money(
        s.totalLoss,
        f
      )} of expenses.`;
    },
  },
  {
    id: "spent",
    keywords: ["how much have i spent", "how much did i spend", "total spent", "total expenses", "expenses", "spending", "spent"],
    reply: (s, f) => {
      if (s.expenseCount === 0)
        return "You have not logged any expenses yet. Add one from the home page and I will keep the totals for you.";
      return `You have spent ${money(s.totalLoss, f)} across ${s.expenseCount} ${
        s.expenseCount === 1 ? "entry" : "entries"
      } — that is ${s.spentPercent.toFixed(1)}% of your monthly income. Your average expense is ${money(
        s.averageExpense,
        f
      )}.`;
    },
  },
  {
    id: "income",
    keywords: ["income", "how much did i earn", "salary", "monthly income", "payment", "earned"],
    reply: (s, f) =>
      `Your monthly income is set to ${money(s.payment, f)}, and you have logged ${money(
        s.totalIncome,
        f
      )} of extra income across ${s.incomeCount} ${
        s.incomeCount === 1 ? "entry" : "entries"
      }.`,
  },
  {
    id: "biggest",
    keywords: ["biggest expense", "largest expense", "most expensive", "biggest cost", "biggest income", "largest income"],
    reply: (s, f) => {
      const parts = [];
      if (s.biggestExpense)
        parts.push(
          `Your biggest expense is ${money(s.biggestExpense.amount, f)}${
            s.biggestExpense.text ? ` for "${s.biggestExpense.text}"` : ""
          }.`
        );
      if (s.biggestIncome)
        parts.push(
          `Your biggest income entry is ${money(s.biggestIncome.amount, f)}${
            s.biggestIncome.text ? ` from "${s.biggestIncome.text}"` : ""
          }.`
        );
      return parts.length
        ? parts.join(" ")
        : "There are no entries yet, so there is nothing to compare. Add an expense or income on the home page.";
    },
  },
  {
    id: "cashcard",
    keywords: ["cash or card", "cash", "card", "payment method", "how do i pay"],
    reply: (s, f) => {
      if (s.totalLoss === 0)
        return "No expenses yet, so there is no cash-versus-card split to show. Each expense can be marked as cash or card when you add it.";
      const cashShare = (s.cash / s.totalLoss) * 100;
      return `You spent ${money(s.cash, f)} in cash (${cashShare.toFixed(
        0
      )}%) and ${money(s.card, f)} by card (${(100 - cashShare).toFixed(0)}%).`;
    },
  },
  {
    id: "hours",
    keywords: ["how many hours", "hours worked", "work hours", "total hours", "shifts"],
    reply: (s) => {
      if (s.shiftCount === 0)
        return "No shifts logged yet. Open Work Hours, set your hourly rate, then add a shift — or tap a day on the calendar.";
      return `You have logged ${hours(s.totalHours)} across ${s.shiftCount} ${
        s.shiftCount === 1 ? "shift" : "shifts"
      }, which averages ${hours(s.totalHours / s.shiftCount)} per shift.`;
    },
  },
  {
    id: "earnings",
    keywords: ["earnings", "how much have i made", "hourly rate", "rate", "made from work", "paid"],
    reply: (s, f) => {
      if (s.shiftCount === 0)
        return "Once you log shifts on the Work Hours page I can total up your earnings. You can then push that total into your monthly income with Set Payment.";
      return `Your logged shifts are worth ${money(
        s.earnings,
        f
      )}, at an average rate of ${money(s.averageRate, f)} per hour.`;
    },
  },
  {
    id: "daysoff",
    keywords: ["days off", "day off", "vacation", "holiday", "rest day", "time off"],
    reply: (s) =>
      `You have ${s.daysOff} rest ${s.daysOff === 1 ? "day" : "days"} and ${
        s.vacationDays
      } vacation ${
        s.vacationDays === 1 ? "day" : "days"
      } marked. On the calendar, tap an empty day and choose Cancel to mark Rest, then tap it again for Vacation.`,
  },
  {
    id: "howto-expense",
    keywords: ["add an expense", "add expense", "log expense", "record spending", "add income", "add money"],
    reply: () =>
      "On the home page, open Add Expense or Add Income, type a name and an amount, pick the date and whether it was cash or card, then save. The totals and the progress bar update straight away.",
  },
  {
    id: "howto-hours",
    keywords: ["log hours", "add hours", "add a shift", "log a shift", "record hours", "how do i add work"],
    reply: () =>
      "Go to Work Hours, set your hourly rate once, then add a shift with its start and end time. You can also tap an empty day on the home calendar to log a quick shift.",
  },
  {
    id: "howto-payment",
    keywords: ["set payment", "set my income", "change salary", "monthly budget", "set budget"],
    reply: () =>
      "Tap Set Payment on the home page. Type the amount yourself, or apply the earnings from the hours you already logged so your income matches the work you did.",
  },
  {
    id: "howto-reset",
    keywords: ["reset", "clear", "new month", "start over", "delete everything"],
    reply: () =>
      "Reset Stats on the home page clears your expenses, income, and monthly payment — handy at the start of a new month. It asks for confirmation first, and it cannot be undone.",
  },
  {
    id: "privacy",
    keywords: ["privacy", "is my data safe", "where is my data", "cloud", "account", "sign up", "login"],
    reply: () =>
      "There is no account and no server. Everything is saved in this browser's local storage, so your data stays on this device — and clearing your browser data will clear it too.",
  },
  {
    id: "theme",
    keywords: ["dark mode", "light mode", "theme", "night mode"],
    reply: () =>
      "Open the settings menu in the header and use the theme switch. Money Map remembers your choice for next time.",
  },
  {
    id: "contact",
    keywords: ["contact", "email", "support", "bug", "report a problem", "feedback", "suggestion"],
    reply: () =>
      "The Contact page has a message form that emails the developer directly — great for bugs, ideas, or feedback. You will find it in the menu.",
  },
  {
    id: "thanks",
    keywords: ["thanks", "thank you", "cheers", "nice", "great", "efharisto"],
    reply: () => "Any time. Ask me whenever you want a number or a quick how-to.",
  },
];

const normalize = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Picks the best intent for a question and renders its reply. */
export const askZenn = (question, snapshot, formatMoney) => {
  const text = normalize(question);

  if (!text) {
    return "Ask me anything about your money or your hours — for example, \"how much is left?\"";
  }

  let best = null;
  let bestScore = 0;

  for (const intent of INTENTS) {
    for (const keyword of intent.keywords) {
      const key = normalize(keyword);
      if (!key || !text.includes(key)) continue;
      // Longer, more specific keyword matches win.
      const score = key.length;
      if (score > bestScore) {
        bestScore = score;
        best = intent;
      }
    }
  }

  if (!best) {
    return "I did not catch that one. I can help with your balance, expenses, income, work hours, earnings, days off, and how to use any page. Try \"how much have I spent?\" or \"how do I log hours?\"";
  }

  return best.reply(snapshot, formatMoney);
};

export const ZENN_SUGGESTIONS = [
  "How much is left?",
  "How much have I spent?",
  "How many hours did I work?",
  "What was my biggest expense?",
  "How do I log hours?",
  "What is Money Map?",
];
