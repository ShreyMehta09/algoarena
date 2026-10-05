import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");
const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/verify-email?token=${token}`;

  if (!process.env.RESEND_API_KEY) {
    console.log("=========================================");
    console.log("MOCK EMAIL: Verification Link");
    console.log(`To: ${email}`);
    console.log(`Link: ${confirmLink}`);
    console.log("=========================================");
    return;
  }

  try {
    await resend.emails.send({
      from: "AlgoArena <onboarding@resend.dev>",
      to: email,
      subject: "Confirm your email - AlgoArena",
      html: `<p>Click <a href="${confirmLink}">here</a> to confirm your email.</p>`,
    });
  } catch (error) {
    console.error("Failed to send verification email", error);
  }
};
