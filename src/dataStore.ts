// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
import { Data } from './dataTypes';
export const DATABASE_FILE = 'database.json';
import fs from 'fs';

let data: Data = {
  users: [],
  quizzes: [],
  userSessions: [],
  quizSessions: [],
  players: [],
  messages: [],
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
export function getData(): Data {
  if (fs.existsSync('./database.json')) {
    const file = fs.readFileSync('./database.json', { flag: 'r' });
    return JSON.parse(file.toString());
  }
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
export function setData(newData: Data): void {
  data = newData;
  const dataStr = JSON.stringify(data, null, 2);
  fs.writeFileSync('./database.json', dataStr, { flag: 'w' });
}
