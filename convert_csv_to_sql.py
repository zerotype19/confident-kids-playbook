import csv
import json

def clean_text(text):
    if not text:
        return ''
    # Replace newlines with spaces and escape single quotes
    return text.replace('\n', ' ').replace("'", "''").strip()

def convert_csv_to_sql():
    # First, delete related records from challenge_logs
    print("DELETE FROM challenge_logs WHERE 1=1;")
    
    # Then delete all challenges
    print("DELETE FROM challenges WHERE 1=1;")
    
    # Then, read the CSV and create INSERT statements
    with open('merge.csv', 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Clean and prepare the data
            steps = row['steps'].replace('\n', ' ').strip()
            if steps.startswith('[') and steps.endswith(']'):
                try:
                    # Parse and re-encode as a proper JSON array
                    steps_array = json.loads(steps)
                    # Convert to SQLite JSON array format
                    steps = f"json_array({','.join(f"'{clean_text(step)}'" for step in steps_array)})"
                except json.JSONDecodeError:
                    # If JSON parsing fails, treat it as a regular string
                    steps = f"'{clean_text(steps)}'"
            else:
                # If it's not a JSON array, wrap it in quotes
                steps = f"'{clean_text(steps)}'"

            # Generate the SQL statement with explicit column values
            sql = f"""INSERT INTO challenges (
                id, 
                title, 
                description, 
                goal, 
                steps, 
                example_dialogue, 
                tip, 
                pillar_id, 
                age_range, 
                difficulty_level
            ) VALUES (
                '{clean_text(row['id'])}',
                '{clean_text(row['title'])}',
                '{clean_text(row['description'])}',
                '{clean_text(row['goal'])}',
                {steps},
                '{clean_text(row['example_dialogue'])}',
                '{clean_text(row['tip'])}',
                {int(row['pillar_id'])},
                '{clean_text(row['age_range'])}',
                '{clean_text(row['difficulty_level'])}'
            );"""
            print(sql)

if __name__ == "__main__":
    convert_csv_to_sql() 