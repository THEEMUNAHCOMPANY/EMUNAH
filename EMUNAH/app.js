// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Enable submit only when consent checked
const consent = document.getElementById("consent");
const submitBtn = document.getElementById("submit-btn");
const form = document.getElementById("subscribe-form");
const formMsg = document.getElementById("form-msg");

consent.addEventListener("change", () => {
  submitBtn.disabled = !consent.checked;
});

// Optional: light phone formatting
const phoneInput = form.querySelector('input[name="phone"]');
phoneInput.addEventListener("input", () => {
  let x = phoneInput.value.replace(/\D/g, "").slice(0, 10);
  const p = [];
  if (x.length > 0) p.push("(" + x.slice(0,3) + ")");
  if (x.length >= 4) p.push(" " + x.slice(3,6));
  if (x.length >= 7) p.push("-" + x.slice(6,10));
  phoneInput.value = p.join("");
});

// Handle submit → calls our Vercel API route (stubbed now)
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formMsg.textContent = "";
  submitBtn.disabled = true;

  const payload = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    phone: phoneInput.value.replace(/\D/g, ""),
    consent: consent.checked
  };

  // Simple client validation
  if (!payload.name || !payload.email || payload.phone.length < 10 || !payload.consent) {
    formMsg.textContent = "Please fill all fields and accept messages.";
    submitBtn.disabled = !consent.checked;
    return;
  }

  try {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Failed to subscribe");
    const data = await res.json();
    formMsg.textContent = data.message || "Thanks! You’ll start getting daily texts soon.";
    form.reset();
    submitBtn.disabled = true;
  } catch (err) {
    formMsg.textContent = "Something went wrong. Please try again.";
    console.error(err);
    submitBtn.disabled = !consent.checked;
  }
});

