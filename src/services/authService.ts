import { AppDataSource } from "@/infrastructure/database"
import { User } from "@/entities/User"
import { OTP } from "@/entities/OTP"
import { hashPassword, comparePassword } from "@/utils/hash"
import { generateOTP } from "@/utils/otp"
import { sendEmail } from "@/utils/mail"

const userRepo = AppDataSource.getRepository(User)
const otpRepo = AppDataSource.getRepository(OTP)

export class AuthService {

  static async register(name: string, email: string, password: string) {
    const existing = await userRepo.findOne({ where: { email } })

    if (existing) {
      throw new Error("User already exists")
    }

    const hashed = await hashPassword(password)

    const user = userRepo.create({
      name,
      email,
      password: hashed
    })

    return await userRepo.save(user)
  }

static async login(email: string, password: string) {


const user = await userRepo.findOne({ where: { email } })

if (!user) throw new Error("User not found")

const valid = await comparePassword(password, user.password)

if (!valid) throw new Error("Invalid password")

return user


}

  static async sendOTP(email: string) {
    const otp = generateOTP()

    const otpEntity = otpRepo.create({
      email,
      otp
    })

    await otpRepo.save(otpEntity)

    await sendEmail(
      email,
      "Your OTP Code",
      `Your OTP code is: ${otp}. It will expire in 5 minutes.`
    )
  }

  static async verifyOTP(email: string, otp: string) {
    const record = await otpRepo.findOne({
      where: { email, otp },
      order: { created_at: "DESC" }
    })

    if (!record) throw new Error("Invalid OTP")

    const now = new Date()
    const diff = now.getTime() - new Date(record.created_at).getTime()
    const fiveMinutes = 5 * 60 * 1000

    if (diff > fiveMinutes)
      throw new Error("OTP expired")

    // Update the record to reflect it was successfully verified
    record.verify_otp = otp
    await otpRepo.save(record)

    return true
  }

static async forgotPassword(email: string, newPassword: string) {


const user = await userRepo.findOne({ where: { email } })

if (!user) throw new Error("User not found")

user.password = await hashPassword(newPassword)

return await userRepo.save(user)


}
}
