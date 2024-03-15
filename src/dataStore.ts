// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
import { Data } from './types';
import fs from 'fs';

let data: Data = {
  users: [],
  quizzes: [],
  userId_counter: 0,
  quizId_counter: 0,
};

// YOU SHOULD MODIFY THIS OBJECT ABOVE ONLY

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
function getData(): Data {
  if (fs.existsSync('./database.json')) {
    const file = fs.readFileSync('./database.json');
    console.log(file); // Display the file content (for debugging purposes - to Remove)
    data = JSON.parse(file.toString());
  }
  return data;
};

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: Data): void {
  data = newData;
  try {
    fs.writeFileSync('./database.json', JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save data to file: ${error}`);
  }  
};

export { getData, setData };
