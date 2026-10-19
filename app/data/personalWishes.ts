import { sisters, type Sister } from "./sisters";
import messages from "./personal-wishes.json";

// Owner-authored cards only. Edit personal-wishes.json to publish your messages.
export const personalRecipients: Sister[] = sisters.map((person) => ({
  ...person,
  ...messages.find((message) => message.slug === person.slug),
}));
export const personalWishes = personalRecipients.filter((person) => person.wish.trim());
