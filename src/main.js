import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "TU_SUPABASE_URL",
  "TU_SUPABASE_ANON_KEY"
)

/* =========================
   SYNC USER
========================= */
async function syncUser(user) {
  if (!user?.email) return

  const { data } = await supabase
    .from("users")
    .select("email")
    .eq("email", user.email)

  if (!data || data.length === 0) {
    await supabase.from("users").insert({
      email: user.email,
      plan: "free"
    })
  }
}

/* =========================
   LOGIN
========================= */
window.loginUser = async () => {
  const email = document.getElementById("emailInput").value

  await supabase.auth.signInWithOtp({ email })

  alert("Revisa tu email")
}

/* =========================
   STRIPE
========================= */
window.buyPro = async () => {
  const { data } = await supabase.auth.getUser()
  const user = data?.user

  if (!user) return alert("Login primero")

  const res = await fetch("http://localhost:3001/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: user.email })
  })

  const json = await res.json()
  window.location.href = json.url
}

/* =========================
   LOAD DASHBOARD
========================= */
async function loadDashboard() {
  const { data } = await supabase.auth.getUser()
  const user = data?.user

  if (!user) return

  await syncUser(user)

  const { data: dbUser } = await supabase
    .from("users")
    .select("plan")
    .eq("email", user.email)
    .single()

  const isPro = dbUser?.plan === "pro"

  document.getElementById("planStatus").innerText =
    isPro ? "PRO ACTIVE" : "FREE PLAN"

  document.getElementById("proArea").style.display = isPro ? "block" : "none"
  document.getElementById("freeArea").style.display = isPro ? "none" : "block"
}

/* =========================
   INIT
========================= */
loadDashboard()

supabase.auth.onAuthStateChange(() => {
  loadDashboard()
})