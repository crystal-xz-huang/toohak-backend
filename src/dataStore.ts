// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
import fs from 'fs';
export const DATABASE_FILE = 'database.json';
import { Data } from './dataTypes';
export let dataStore: Data = {
  users: [],
  quizzes: [],
  userSessions: [],
  quizSessions: [],
  players: [],
  messages: [],
};

// ========================================================================= //
const DEPLOYED_URL = 'https://1531-24t1-h17a-dream1.vercel.app';
import request, { HttpVerb } from 'sync-request';
const requestHelper = (method: HttpVerb, path: string, payload: object) => {
  let json = {};
  let qs = {};
  if (['POST', 'DELETE'].includes(method)) {
  qs = payload;
  } else {
  json = payload;
  }

  const res = request(method, DEPLOYED_URL + path, { qs, json, timeout: 20000 });
  return JSON.parse(res.body.toString());
};

// Load data from the remote database
export const getData = (): Data => {
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
export const setData = (newData: Data) => {
  requestHelper('PUT', '/data', { data: newData });
};

// Save data to the database file
export const saveData = (dataStore: Data) => {
  fs.writeFileSync(DATABASE_FILE, JSON.stringify(dataStore, null, 2));
}

// Load data from the database file
export const loadData = (): Data => {
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

