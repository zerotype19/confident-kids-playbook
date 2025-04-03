import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parse/sync';

interface Challenge {
  id: string;
  title: string;
  description: string;
  goal: string;
  steps: string;
  example_dialogue: string;
  tip: string;
  pillar_id: string;
  age_range: string;
  difficulty_level: string;
}

const csvFilePath = path.join(__dirname, '../data/seed_challenges__150_.csv');
const sqlFilePath = path.join(__dirname, '../data/seed_challenges.sql');

// Read CSV file
const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
const records = csv.parse(fileContent, {
  columns: true,
  skip_empty_lines: true
}) as Challenge[];

// Generate SQL statements
const sqlStatements = records.map(record => {
  const escapedTitle = record.title.replace(/'/g, "''");
  const escapedDescription = record.description.replace(/'/g, "''");
  const escapedGoal = record.goal.replace(/'/g, "''");
  const escapedExampleDialogue = record.example_dialogue.replace(/'/g, "''");
  const escapedTip = record.tip.replace(/'/g, "''");

  return `INSERT INTO challenges (
    id, title, description, goal, steps, example_dialogue, tip, pillar_id, age_range, difficulty_level
  ) VALUES (
    '${record.id}',
    '${escapedTitle}',
    '${escapedDescription}',
    '${escapedGoal}',
    '${record.steps}',
    '${escapedExampleDialogue}',
    '${escapedTip}',
    ${record.pillar_id},
    '${record.age_range}',
    ${record.difficulty_level}
  );`;
});

// Write SQL file
fs.writeFileSync(sqlFilePath, sqlStatements.join('\n\n'));
console.log('SQL file generated successfully!'); 