const INDIA_TIME_ZONE = "Asia/Kolkata";

const getIndiaDateParts = (date = new Date()) => {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: INDIA_TIME_ZONE,
        year: "numeric",
        month: "numeric",
        day: "numeric"
    }).formatToParts(new Date(date));

    const values = {};
    parts.forEach((part) => {
        if (part.type !== "literal") values[part.type] = Number(part.value);
    });

    return values;
};

const getMonthRange = (date = new Date()) => {
    const { year, month } = getIndiaDateParts(date);
    const offset = 5.5 * 60 * 60 * 1000;

    const start = new Date(Date.UTC(year, month - 1, 1) - offset);
    const end = new Date(Date.UTC(year, month, 1) - offset);

    return { start, end, year, month };
};

const getMonthKey = (date) => {
    const { year, month } = getIndiaDateParts(date);
    return `${year}-${String(month).padStart(2, "0")}`;
};

const getMonthLabel = (date) =>
    new Intl.DateTimeFormat("en-IN", {
        timeZone: INDIA_TIME_ZONE,
        month: "long",
        year: "numeric"
    }).format(new Date(date));

module.exports = {
    getMonthRange,
    getMonthKey,
    getMonthLabel
};
