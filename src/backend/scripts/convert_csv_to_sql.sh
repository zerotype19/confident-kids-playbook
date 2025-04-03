#!/bin/bash

# Create SQL file header
echo "-- Generated SQL for challenges" > src/backend/data/seed_challenges.sql

# Read CSV and generate INSERT statements
tail -n +2 src/backend/data/seed_challenges__150_.csv | while IFS=, read -r id title description goal steps example_dialogue tip pillar_id age_range difficulty_level; do
    # Escape single quotes in text fields
    title=$(echo "$title" | sed "s/'/''/g")
    description=$(echo "$description" | sed "s/'/''/g")
    goal=$(echo "$goal" | sed "s/'/''/g")
    example_dialogue=$(echo "$example_dialogue" | sed "s/'/''/g")
    tip=$(echo "$tip" | sed "s/'/''/g")
    
    # Generate INSERT statement
    echo "INSERT INTO challenges (id, title, description, goal, steps, example_dialogue, tip, pillar_id, age_range, difficulty_level) VALUES ('$id', '$title', '$description', '$goal', '$steps', '$example_dialogue', '$tip', $pillar_id, '$age_range', $difficulty_level);" >> src/backend/data/seed_challenges.sql
done 