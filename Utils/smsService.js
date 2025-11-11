import { client, twilioPhone } from "../Config/twilioConfig.js";

export const sendSms = async (phone, message) => {
  try {
    await client.messages.create({
      body: message,
      from: twilioPhone,
      to: phone,
    });
    console.log(`✅ SMS sent to ${phone}`);
  } catch (error) {
    console.log("❌ SMS Error:", error.message);
  }
};
