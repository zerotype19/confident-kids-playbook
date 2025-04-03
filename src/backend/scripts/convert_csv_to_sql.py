import csv
import json

def escape_sql_string(s):
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

def convert_csv_to_sql():
    # Read the CSV file
    with open('src/backend/data/seed_challenges__150_.csv', 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        
        # Create SQL file
        with open('src/backend/data/seed_challenges_full.sql', 'w') as sqlfile:
            # Write the DELETE statement
            sqlfile.write('-- Clear existing data\n')
            sqlfile.write('DELETE FROM challenges;\n\n')
            
            # Write the INSERT statement header
            sqlfile.write('-- Insert all 150 challenges\n')
            sqlfile.write('INSERT INTO challenges (id, title, description, goal, steps, example_dialogue, tip, pillar_id, age_range, difficulty_level) VALUES\n')
            
            # Process each row
            rows = list(reader)
            for i, row in enumerate(rows):
                # Convert steps from string to proper JSON
                steps = json.loads(row['steps'])
                
                # Create the VALUES part
                values = [
                    escape_sql_string(row['id']),
                    escape_sql_string(row['title']),
                    escape_sql_string(row['description']),
                    escape_sql_string(row['goal']),
                    escape_sql_string(json.dumps(steps)),
                    escape_sql_string(row['example_dialogue']),
                    escape_sql_string(row['tip']),
                    row['pillar_id'],
                    escape_sql_string(row['age_range']),
                    row['difficulty_level']
                ]
                
                # Write the row
                sqlfile.write('(' + ', '.join(values) + ')')
                
                # Add comma or semicolon
                if i < len(rows) - 1:
                    sqlfile.write(',\n')
                else:
                    sqlfile.write(';\n')

if __name__ == '__main__':
    convert_csv_to_sql() 