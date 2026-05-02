import "reflect-metadata"
import "dotenv/config"
import express from "express"
import { initializeDatabase } from "@/infrastructure/database"
import authRoutes from "@/routes/authRoutes"

const app = express()

app.use(express.json())

app.use("/api/auth", authRoutes)

const PORT = process.env.PORT || 3000

const startServer = async () => {

const dbConnected = await initializeDatabase()

if (dbConnected) {


app.listen(PORT, () => {
console.log(`🚀 Server running on port ${PORT}`)
})


} else {

console.log("⚠️ Server not started due to DB connection failure")


}
}

startServer()
