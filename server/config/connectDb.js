import mogoose from "mongoose"

const connectDb = async () => {
    try {
        await mogoose.connect(process.env.MONGODB_URL)
        console.log("Database connected")
    } catch (error) {
        console.log(`Database error ${error}`)
    }
}

export default connectDb