import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // Allow for a global variable in development
  var _mongoClientPromise: Promise<MongoClient>;
}

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/dnd";

if (!uri) {
  throw new Error("Please add your Mongo URI to .env");
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
