const form = document.getElementById("trip-form");
const message = document.getElementById("form-message");
const startDate = document.getElementById("start-date");
const endDate = document.getElementById("end-date");

function toDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function parseDate(value) {
  if (!value) {
    return null;
  }
  return new Date(value + "T00:00:00");
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(value) {
  return parseDate(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const today = new Date();
today.setHours(0, 0, 0, 0);
startDate.min = toDateValue(today);

const defaultStart = addDays(today, 14);
const defaultEnd = addDays(defaultStart, 7);
startDate.value = toDateValue(defaultStart);
endDate.value = toDateValue(defaultEnd);
endDate.min = toDateValue(addDays(defaultStart, 1));

startDate.addEventListener("change", () => {
  const from = parseDate(startDate.value);
  const to = parseDate(endDate.value);
  if (!from) {
    return;
  }

  endDate.min = toDateValue(addDays(from, 1));
  if (!to || to <= from) {
    endDate.value = toDateValue(addDays(from, 7));
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const airport = form.airport.value.trim();
  const budget = form.budget.value;
  const travellers = form.travellers.value;
  const styles = Array.from(
    form.querySelectorAll('input[name="style"]:checked')
  ).map((box) => box.value);
  const styleText =
    styles.length === 0 ? "any travel style" : styles.join(", ");

  message.hidden = false;
  message.textContent =
    "Thanks. We have your search from " +
    airport +
    " for £" +
    budget +
    ", " +
    formatDate(startDate.value) +
    " to " +
    formatDate(endDate.value) +
    ", " +
    travellers +
    " traveller(s), " +
    styleText +
    ". Trip matching will come in a later version.";
});
