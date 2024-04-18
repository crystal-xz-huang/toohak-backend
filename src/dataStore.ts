// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
import { Data } from './dataTypes';
export const DATABASE_FILE = 'database.json';
// import fs from 'fs';
import { requestHelper } from './httpHelpers';

// let data: Data = {
//   users: [],
//   quizzes: [],
//   userSessions: [],
//   quizSessions: [],
//   players: [],
//   messages: [],
// };


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

export const setData = (newData: Data) => {
  requestHelper('PUT', '/data', { data: newData });
};


// // Use get() to access the data
// export function getData(): Data {
//   if (fs.existsSync('./database.json')) {
//     const file = fs.readFileSync('./database.json', { flag: 'r' });
//     return JSON.parse(file.toString());
//   }
//   return data;
// }

// // Use set(newData) to pass in the entire data object, with modifications made
// export function setData(newData: Data): void {
//   data = newData;
//   const dataStr = JSON.stringify(data, null, 2);
//   fs.writeFileSync('./database.json', dataStr, { flag: 'w' });
// }