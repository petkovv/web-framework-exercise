import { User } from "./models/User";

const user = new User({ name: "Test User", age: 999 });

// user.set({ name: 'Goshoooooooo', age: 35 });

user.save()