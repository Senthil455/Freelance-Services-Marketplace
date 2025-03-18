const fs = require('fs');
const readline = require('readline');

const file = 'notes.json';

function load() {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

function save(notes) {
  fs.writeFileSync(file, JSON.stringify(notes, null, 2));
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Note text: ', (text) => {
  const notes = load();
  notes.push({ text, at: new Date().toISOString() });
  save(notes);
  console.log('Saved.', notes.length, 'note(s) total.');
  rl.close();
});
