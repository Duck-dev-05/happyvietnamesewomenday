import { getWishStore } from "../app/lib/wishStore.ts";

const database = await getWishStore();
const recipients = await database.list();
const wishes = await database.allWishes();
console.log(`Database ready: ${recipients.length} recipients, ${wishes.length} saved wishes.`);
database.close();
