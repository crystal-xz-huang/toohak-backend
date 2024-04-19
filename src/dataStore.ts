// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
import fs from 'fs';
export const DATABASE_FILE = 'database.json';
import { Data } from './dataTypes';
import { requestHelper } from './httpHelpers';

export let dataStore: Data = {
  users: [],
  quizzes: [],
  userSessions: [],
  quizSessions: [],
  players: [],
  messages: [],
};

// Load data from the remote database
export const loadData = (): Data => {
  try {
    const res = requestHelper('GET', '/data', {});
    return res.jsonBody.data;
  } catch (e) {
    return {
      users: [],
      quizzes: [],
      userSessions: [],
      quizSessions: [],
      players: [],
      messages: [],
    };
  }
};

// Save data to the remote database
export const saveData = (newData: Data) => {
  requestHelper('PUT', '/data', { data: newData });
};

// Save data to the database file
export const setData = (dataStore: Data) => {
  fs.writeFileSync(DATABASE_FILE, JSON.stringify(dataStore, null, 2));
  return { message: 'Data saved successfully' };
}

// Load data from the database file
export const getData = (): Data => {
  if (fs.existsSync(DATABASE_FILE)) {
    return JSON.parse(String(fs.readFileSync(DATABASE_FILE)));
  } else {
    return {
      users: [],
      quizzes: [],
      userSessions: [],
      quizSessions: [],
      players: [],
      messages: [],
    };
  }
}

