import { Client, Databases, Query } from "appwrite";

const client = new Client()
    .setEndpoint("https://nyc.cloud.appwrite.io/v1")
    .setProject("697cc61100186f169a5d");

const databases = new Databases(client);

async function test() {
    try {
        const response = await databases.listDocuments(
            "697cdb13001c5a9ff448",
            "69d2d23a00120484f908",
            [
                Query.startsWith("name", "A") // Just throwing "A" to test
            ]
        );
        console.log("Success:", response);
    } catch (e) {
        console.error("Appwrite Error Name:", e.name);
        console.error("Appwrite Error Code:", e.code);
        console.error("Appwrite Error Message:", e.message);
        console.error("Appwrite Error Response:", e.response);
    }
}

test();
