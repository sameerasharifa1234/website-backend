import { adminAuth, adminDb } from "./firebaseAdmin";
import { UserRecord } from "firebase-admin/lib/auth";
import { sendMail } from "./mailer";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  idToken: string;
}

// Register a new user
export const registerUser = async ({ name, email, password }: RegisterPayload): Promise<UserRecord> => {
  const userRecord = await adminAuth.createUser({
    email,
    password,
    displayName: name,
  });

  await adminDb.collection("users").doc(userRecord.uid).set({
    name,
    email,
    password,
    createdAt: new Date(),
  });

  return userRecord;
};

// Verify login token
export const verifyLogin = async ({ idToken }: LoginPayload) => {
  const decodedToken = await adminAuth.verifyIdToken(idToken);
  return decodedToken;
};

// Delete a user
export const deleteUser = async (uid: string) => {
  await adminAuth.deleteUser(uid);
  await adminDb.collection("users").doc(uid).delete();
};

// Reset password (send email link via Firebase client SDK, backend can trigger if needed)
export const generatePasswordResetLink = async (email: string) => {
  const link = await adminAuth.generatePasswordResetLink(email);
  return link;
};

// Generate and send OTP for forgot password
export const generateAndSendOtp = async (email: string) => {
  // 1. Check if user exists
  try {
    await adminAuth.getUserByEmail(email);
  } catch (err: any) {
    if (err.code === "auth/user-not-found") {
      throw new Error("Please enter the registered email id");
    }
    throw err;
  }

  // 2. Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  // 3. Store OTP in Firestore
  await adminDb.collection("otps").doc(email).set({
    otp,
    expiresAt,
    createdAt: new Date(),
  });

  // 4. Send OTP via email
  const subject = "Your Password Reset OTP";
  const text = `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
      <h2 style="color: #4f46e5;">Password Reset OTP</h2>
      <p style="color: #475569; font-size: 16px;">You requested a password reset. Please use the following code to proceed:</p>
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1e293b;">${otp}</span>
      </div>
      <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
    </div>
  `;

  await sendMail(email, subject, text, html);

  return { message: "OTP sent successfully" };
};

// Verify OTP
export const verifyOtp = async (email: string, otp: string) => {
  const otpDoc = await adminDb.collection("otps").doc(email).get();

  if (!otpDoc.exists) {
    throw new Error("OTP not found or expired.");
  }

  const data = otpDoc.data();
  if (!data) throw new Error("Invalid OTP data.");

  if (new Date() > data.expiresAt.toDate()) {
    await adminDb.collection("otps").doc(email).delete();
    throw new Error("OTP has expired.");
  }

  if (data.otp !== otp) {
    throw new Error("Invalid OTP code.");
  }

  // OTP is valid
  return { message: "OTP verified" };
};

// Reset Password
export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  // 1. Verify OTP first (security best practice)
  await verifyOtp(email, otp);

  // 2. Get user by email to get UID
  const user = await adminAuth.getUserByEmail(email);

  // 3. Update password in Firebase Auth
  await adminAuth.updateUser(user.uid, {
    password: newPassword,
  });

  // 4. Update password in Firestore (if user details stored there)
  await adminDb.collection("users").doc(user.uid).set({
    email,
    password: newPassword,
  }, { merge: true });

  // 5. Delete OTP after successful reset
  await adminDb.collection("otps").doc(email).delete();

  return { message: "Password reset successful" };
};

// Generate and send OTP for registration
export interface PendingRegisterPayload extends RegisterPayload { }

export const generateAndSendRegisterOtp = async (data: PendingRegisterPayload) => {
  const { email } = data;

  // 1. Check if user already exists
  try {
    await adminAuth.getUserByEmail(email);
    throw new Error("Email already registered. Please login instead.");
  } catch (err: any) {
    if (err.code !== "auth/user-not-found") {
      throw err;
    }
  }

  // 2. Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // 3. Store pending data and OTP in Firestore
  await adminDb.collection("pending_users").doc(email).set({
    ...data,
    otp,
    expiresAt,
    createdAt: new Date(),
  });

  // 4. Send OTP via email
  const subject = "Verify Your Account - OTP";
  const text = `Your OTP for account registration is: ${otp}. It will expire in 15 minutes.`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #4f46e5;">Welcome! Verify Your Email</h2>
      <p style="color: #475569; font-size: 16px;">Thanks for joining us! Please use the following code to complete your registration:</p>
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1e293b;">${otp}</span>
      </div>
      <p style="color: #64748b; font-size: 14px;">This code will expire in 15 minutes. If you didn't create an account, please ignore this email.</p>
    </div>
  `;

  await sendMail(email, subject, text, html);

  return { message: "Verification code sent to your email" };
};

// Verify and Register User
export const verifyAndRegisterUser = async (email: string, otp: string) => {
  const pendingDoc = await adminDb.collection("pending_users").doc(email).get();

  if (!pendingDoc.exists) {
    throw new Error("Verification record not found. Please try registering again.");
  }

  const data = pendingDoc.data();
  if (!data) throw new Error("Invalid verification data.");

  if (new Date() > data.expiresAt.toDate()) {
    await adminDb.collection("pending_users").doc(email).delete();
    throw new Error("Verification code has expired. Please try registering again.");
  }

  if (data.otp !== otp) {
    throw new Error("Invalid verification code.");
  }

  // OTP is valid - Complete registration
  const { name, password } = data;
  const userRecord = await registerUser({ name, email, password });

  // Cleanup
  await adminDb.collection("pending_users").doc(email).delete();

  return { message: "Account created successfully", uid: userRecord.uid };
};