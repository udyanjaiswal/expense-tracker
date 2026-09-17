const {
    getMonthRange,
    getMonthKey,
    getMonthLabel
} = require("./utils/month");

console.log("\n======================================");
console.log(" MONTHLY EXPENSE LOGIC TEST");
console.log("======================================\n");

// --------------------------------------------------
// FAKE DATA
// This is ONLY test data.
// Nothing is written to MongoDB.
// --------------------------------------------------

const allocations = [
    {
        employee: "EMP001",
        amount: 5000,
        allocationDate: "2026-08-01T10:00:00+05:30"
    },
    {
        employee: "EMP001",
        amount: 5000,
        allocationDate: "2026-09-01T10:00:00+05:30"
    },
    {
        employee: "EMP002",
        amount: 3000,
        allocationDate: "2026-09-05T10:00:00+05:30"
    }
];

const expenses = [
    {
        employee: "EMP001",
        amount: 2000,
        expenseDate: "2026-08-31T18:00:00+05:30"
    },
    {
        employee: "EMP001",
        amount: 100,
        expenseDate: "2026-09-01T10:00:00+05:30"
    },
    {
        employee: "EMP001",
        amount: 50,
        expenseDate: "2026-09-10T10:00:00+05:30"
    },
    {
        employee: "EMP001",
        amount: 50,
        expenseDate: "2026-09-15T10:00:00+05:30"
    },
    {
        employee: "EMP002",
        amount: 500,
        expenseDate: "2026-09-18T10:00:00+05:30"
    }
];


// --------------------------------------------------
// CURRENT MONTH
// --------------------------------------------------

const testDate = new Date("2026-09-18T12:00:00+05:30");

const {
    start: monthStart,
    end: nextMonthStart
} = getMonthRange(testDate);

console.log("Current test date:");
console.log(testDate.toString());

console.log("\nCurrent month:");
console.log(getMonthLabel(monthStart));

console.log("\nMonth starts:");
console.log(monthStart.toISOString());

console.log("Next month starts:");
console.log(nextMonthStart.toISOString());


// --------------------------------------------------
// FILTER CURRENT MONTH
// --------------------------------------------------

const currentAllocations = allocations.filter((item) => {
    const date = new Date(item.allocationDate);

    return date >= monthStart && date < nextMonthStart;
});

const currentExpenses = expenses.filter((item) => {
    const date = new Date(item.expenseDate);

    return date >= monthStart && date < nextMonthStart;
});


// --------------------------------------------------
// TOTALS
// --------------------------------------------------

const totalGiven = currentAllocations.reduce(
    (total, item) => total + item.amount,
    0
);

const totalSpent = currentExpenses.reduce(
    (total, item) => total + item.amount,
    0
);

const remaining = totalGiven - totalSpent;


// --------------------------------------------------
// HISTORY
// --------------------------------------------------

const currentKey = getMonthKey(monthStart);

const historyMap = {};

allocations.forEach((item) => {

    const key = getMonthKey(item.allocationDate);

    if (key === currentKey) return;

    if (!historyMap[key]) {
        historyMap[key] = {
            month: key,
            label: getMonthLabel(item.allocationDate),
            totalGiven: 0,
            totalSpent: 0
        };
    }

    historyMap[key].totalGiven += item.amount;
});


expenses.forEach((item) => {

    const key = getMonthKey(item.expenseDate);

    if (key === currentKey) return;

    if (!historyMap[key]) {
        historyMap[key] = {
            month: key,
            label: getMonthLabel(item.expenseDate),
            totalGiven: 0,
            totalSpent: 0
        };
    }

    historyMap[key].totalSpent += item.amount;
});


const history = Object.values(historyMap).map((item) => ({
    ...item,
    remaining: item.totalGiven - item.totalSpent
}));


// --------------------------------------------------
// DISPLAY RESULTS
// --------------------------------------------------

console.log("\n======================================");
console.log(" CURRENT MONTH RESULT");
console.log("======================================");

console.log("\nCurrent allocations:");
console.table(currentAllocations);

console.log("\nCurrent expenses:");
console.table(currentExpenses);

console.log("\nTotal allocated:", totalGiven);
console.log("Total spent:", totalSpent);
console.log("Remaining:", remaining);


console.log("\n======================================");
console.log(" HISTORY RESULT");
console.log("======================================");

console.table(history);


// --------------------------------------------------
// AUTOMATED CHECKS
// --------------------------------------------------

console.log("\n======================================");
console.log(" TEST CHECKS");
console.log("======================================");

let passed = 0;
let failed = 0;

function check(name, condition) {

    if (condition) {
        console.log("✅ PASS:", name);
        passed++;
    } else {
        console.log("❌ FAIL:", name);
        failed++;
    }
}


// September allocation:
// EMP001 = 5000
// EMP002 = 3000
check(
    "September allocation = ₹8,000",
    totalGiven === 8000
);


// September expenses:
// EMP001 = 100 + 50 + 50 = 200
// EMP002 = 500
// Total = 700
check(
    "September spending = ₹700",
    totalSpent === 700
);


// Remaining = 8000 - 700
check(
    "September remaining = ₹7,300",
    remaining === 7300
);


// August ₹2,000 must NOT appear in September
check(
    "August ₹2,000 excluded from current month",
    totalSpent !== 2700
);


// August history should exist
const august = history.find(
    item => item.month === "2026-08"
);

check(
    "August exists in history",
    !!august
);


// August spending should be ₹2,000
check(
    "August spending = ₹2,000",
    august && august.totalSpent === 2000
);


// September should NOT appear in history
const septemberHistory = history.find(
    item => item.month === "2026-09"
);

check(
    "September excluded from history",
    !septemberHistory
);


// Final result
console.log("\n======================================");

if (failed === 0) {

    console.log(
        `🎉 ALL TESTS PASSED (${passed}/${passed})`
    );

} else {

    console.log(
        `⚠️ ${failed} TEST(S) FAILED`
    );

}

console.log("======================================\n");