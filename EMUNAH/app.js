// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

const form = document.getElementById("subscribe-form");
const nameInput = form.querySelector('input[name="name"]');
const emailInput = form.querySelector('input[name="email"]');
const phoneInput = form.querySelector('input[name="phone"]');
const consent = document.getElementById("consent");
const submitBtn = document.getElementById("submit-btn");
const formMsg = document.getElementById("form-msg");

// --- helpers ---
function digitsOnly(str) {
  return (str || "").replace(/\D/g, "");
}
function validEmail(str) {
  // simple, safe email check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}
function checkFormReady() {
  const phoneDigits = digitsOnly(phoneInput.value);
  const ready =
    nameInput.value.trim().length > 0 &&
    validEmail(emailInput.value.trim()) &&
    phoneDigits.length >= 10 &&
    consent.checked;

  submitBtn.disabled = !ready;
  return ready;
}

// Format phone as (###) ###-####
phoneInput.addEventListener("input", () => {
  const x = digitsOnly(phoneInput.value).slice(0, 10);
  let out = "";
  if (x.length > 0) out = "(" + x.slice(0, 3) + ")";
  if (x.length >= 4) out += " " + x.slice(3, 6);
  if (x.length >= 7) out += "-" + x.slice(6, 10);
  phoneInput.value = out;
  checkFormReady();
});

// watch all fields
[nameInput, emailInput, phoneInput, consent].forEach(el => {
  el.addEventListener("input", checkFormReady);
  el.addEventListener("change", checkFormReady);
});

// initialize state on load
submitBtn.disabled = true;
checkFormReady();

// submit handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formMsg.textContent = "";

  if (!checkFormReady ? false : !checkFormReady()) { // if you have checkFormReady()
    formMsg.textContent = "Please fill all fields correctly and accept messages.";
    return;
  }

  submitBtn.disabled = true;

  const payload = {
    name: nameInput ? nameInput.value.trim() : form.name.value.trim(),
    email: emailInput ? emailInput.value.trim() : form.email.value.trim(),
    phone: (phoneInput ? phoneInput.value : form.phone.value).replace(/\D/g, ""),
    consent: consent.checked
  };

  try {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      formMsg.textContent = data.error || "Something went wrong. Please try again.";
      submitBtn.disabled = !consent.checked;
      return;
    }

    formMsg.textContent = data.message || "Thanks! You’ll start getting daily texts soon.";
    form.reset();
    submitBtn.disabled = true; // stays disabled until fields are re-filled
  } catch (err) {
    console.error(err);
    formMsg.textContent = "Network error. Please try again.";
    submitBtn.disabled = !consent.checked;
  }
});
