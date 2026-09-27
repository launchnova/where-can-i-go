const form = document.getElementById("trip-form");
const message = document.getElementById("form-message");
const startDate = document.getElementById("start-date");
const endDate = document.getElementById("end-date");

const results = document.getElementById("results");
const resultsSummary = document.getElementById("results-summary");
const destinationGrid = document.getElementById("destination-grid");

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

function calculateNights(from, to) {
  const difference = to.getTime() - from.getTime();
  return Math.round(difference / (1000 * 60 * 60 * 24));
}

const destinations = {
  Beach: [
    { name: "Lisbon", country: "Portugal", cost: 780 },
    { name: "Malta", country: "Malta", cost: 920 },
    { name: "Barcelona", country: "Spain", cost: 850 },
  ],

  City: [
    { name: "Barcelona", country: "Spain", cost: 850 },
    { name: "Rome", country: "Italy", cost: 890 },
    { name: "Lisbon", country: "Portugal", cost: 780 },
  ],

  Nature: [
    { name: "Madeira", country: "Portugal", cost: 950 },
    { name: "Innsbruck", country: "Austria", cost: 980 },
    { name: "Lake Bled", country: "Slovenia", cost: 900 },
  ],

  Family: [
    { name: "Algarve", country: "Portugal", cost: 880 },
    { name: "Tenerife", country: "Spain", cost: 940 },
    { name: "Majorca", country: "Spain", cost: 860 },
  ],

  Adventure: [
    { name: "Madeira", country: "Portugal", cost: 950 },
    { name: "Interlaken", country: "Switzerland", cost: 1150 },
    { name: "Ljubljana", country: "Slovenia", cost: 900 },
  ],
};

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

  // Hide previous results while validating the new search
  results.hidden = true;

  const airport = form.airport.value.trim();
  const budget = Number(form.budget.value);
  const travellers = Number(form.travellers.value);

  const from = parseDate(startDate.value);
  const to = parseDate(endDate.value);

  const styles = Array.from(
    form.querySelectorAll('input[name="style"]:checked')
  ).map((box) => box.value);

  // Basic validation
  if (!airport) {
    message.hidden = false;
    message.textContent = "Please enter your departure airport.";
    return;
  }

  if (!from || !to) {
    message.hidden = false;
    message.textContent = "Please select your travel dates.";
    return;
  }

  if (to <= from) {
    message.hidden = false;
    message.textContent = "Your return date must be after your departure date.";
    return;
  }

  if (!budget || budget <= 0) {
    message.hidden = false;
    message.textContent = "Please enter a travel budget greater than £0.";
    return;
  }

  if (!travellers || travellers < 1) {
    message.hidden = false;
    message.textContent = "Please enter at least 1 traveller.";
    return;
  }

  if (styles.length === 0) {
    message.hidden = false;
    message.textContent = "Please select at least one travel style.";
    return;
  }

  const nights = calculateNights(from, to);

  // Combine destinations from all selected styles
  const selectedDestinations = [];

  styles.forEach((style) => {
    if (destinations[style]) {
      destinations[style].forEach((destination) => {
        const alreadyAdded = selectedDestinations.some(
          (item) => item.name === destination.name
        );

        if (!alreadyAdded) {
          selectedDestinations.push(destination);
        }
      });
    }
  });

  // Keep destinations within the user's budget
  const matchingDestinations = selectedDestinations
    .filter((destination) => destination.cost <= budget)
    .slice(0, 3);

  message.hidden = false;
  results.hidden = true;

  // No matches
  if (matchingDestinations.length === 0) {
    message.innerHTML = `
      <strong>No matches found yet.</strong><br><br>
      We couldn't find a sample destination within your £${budget.toLocaleString()} budget.
      Try increasing your budget or selecting another travel style.
    `;
    return;
  }

  // Show the results section
  results.hidden = false;
  message.hidden = true;

  resultsSummary.textContent =
    `${formatDate(startDate.value)} to ${formatDate(endDate.value)} · ` +
    `${nights} nights · ${travellers} traveller(s)`;

  destinationGrid.innerHTML = matchingDestinations
    .map(
      (destination) => `
        <article class="destination-card">
          <h3>${destination.name}</h3>

          <p class="destination-country">
            ${destination.country}
          </p>

          <div class="destination-details">
            <span>📅 ${nights} nights</span>
            <span>👥 ${travellers} traveller(s)</span>
            <span class="destination-price">
              💷 From £${destination.cost.toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            class="destination-button"
            onclick="alert('Trip details will be added in a later version.')"
          >
            Explore trip →
          </button>
        </article>
      `
    )
    .join("");
});