const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const twilio = require("twilio");

// Twilio credentials (replace with your actual values)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = new twilio(accountSid, authToken);

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Home");
});

// Route to send an SMS message to the provided number
app.post("/sendsms", async (req, res) => {
  const { to, body } = req.body;

  try {
    const message = await client.messages.create({
      body,
      to,
      from: twilioPhoneNumber,
    });

    console.log(`Message sent with SID: ${message.sid}`);
    res
      .status(200)
      .json({ message: "SMS sent successfully", sid: message.sid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send SMS" });
  }
});

//Bulk message  to send login

app.post("/sendbulksms", async (req, res) => {
  const { numbers, body } = req.body;

  if (!Array.isArray(numbers) || numbers.length === 0) {
    return res.status(400).json({ error: "Invalid or empty 'numbers' array" });
  }

  try {
    const sentMessages = [];

    for (const number of numbers) {
      const message = await client.messages.create({
        body,
        to: number,
        from: twilioPhoneNumber,
      });

      console.log(`Message sent with SID: ${message.sid}`);
      sentMessages.push({ number, sid: message.sid });
    }

    res.status(200).json({ message: "SMS sent successfully", sentMessages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send SMS" });
  }
});


app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
