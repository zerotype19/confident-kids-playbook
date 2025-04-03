import csv
import json

def clean_text(text):
    if text is None:
        return None
    # Escape single quotes and handle special characters
    return text.replace("'", "''").replace('"', '""')

def convert_steps(steps_str):
    if not steps_str:
        return None
    try:
        # Parse the JSON string and convert back to string
        steps = json.loads(steps_str)
        # Convert to JSON string and escape single quotes
        return json.dumps(steps).replace("'", "''")
    except:
        return None

def generate_insert_statements(csv_file):
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Clean and prepare the data
            id = clean_text(row['id'])
            title = clean_text(row['title'])
            description = clean_text(row['description'])
            goal = clean_text(row['goal'])
            steps = convert_steps(row['steps'])
            example_dialogue = clean_text(row['example_dialogue'])
            tip = clean_text(row['tip'])
            pillar_id = row['pillar_id']
            age_range = clean_text(row['age_range'])
            difficulty_level = row['difficulty_level']

            # Generate the INSERT statement with proper escaping
            sql = f"""INSERT INTO challenges (
                id, title, description, goal, steps, example_dialogue, 
                tip, pillar_id, age_range, difficulty_level
            ) VALUES (
                '{id}', '{title}', '{description}', '{goal}', '{steps}', 
                '{example_dialogue}', '{tip}', {pillar_id}, '{age_range}', 
                {difficulty_level}
            );"""
            print(sql)

if __name__ == "__main__":
    csv_file = "data/Confidence_Challenges_Unique_300.csv"
    generate_insert_statements(csv_file) 