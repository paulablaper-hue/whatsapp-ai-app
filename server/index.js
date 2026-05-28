import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

dotenv.config()

const app = express()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.send("OK")
})

app.post("/create-checkout", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: "TU_PRICE_ID",
        quantity: 1
      }
    ],
    customer_email: req.body.email,
    success_url: "https://TU-FRONTEND.vercel.app",
cancel_url: "https://TU-FRONTEND.vercel.app"
  })

  res.json({ url: session.url })
})

app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const event = JSON.parse(req.body)

    if (event.type === "checkout.session.completed") {
      const email = event.data.object.customer_email

      await supabase
        .from("users")
        .update({ plan: "pro" })
        .eq("email", email)
    }

    res.json({ ok: true })
  } catch (e) {
    res.status(400).send("error")
  }
})

app.listen(3001, () => {
  console.log("SERVER OK http://localhost:3001")
})