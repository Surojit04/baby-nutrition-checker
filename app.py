from flask import Flask, render_template, request
import sqlite3

app = Flask(__name__)

# SQLite database connection configuration
def db_connection():
    connection = sqlite3.connect('child_foods.db')  # SQLite uses a file-based database
    return connection

# Function to create the database and table if it doesn't exist
def create_database():
    connection = sqlite3.connect('child_foods.db')
    cursor = connection.cursor()

    # Create table if it doesn't exist
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS baby_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            locality TEXT NOT NULL,
            age INTEGER NOT NULL,
            food TEXT NOT NULL
        )
    ''')

    connection.commit()
    cursor.close()
    connection.close()

# Define nutrients for food items
NUTRIENT_DATA = {
    'MILK': 'VITAMIN D, CALCIUM',
    'SUBSTITUTE': 'VITAMIN D, CALCIUM',
    'RICE': 'VITAMIN B12',
    'BREAD': 'IRON, VITAMIN B12',
    'VEGETABLES': 'VITAMIN A, VITAMIN C, VITAMIN K',
    'EGG': ' VITAMIN D,  IRON, ZINC',
    'FISH': 'VITAMIN D,  ZINC',
    'CHICKEN': 'VITAMIN B12, ZINC',
    'RED_MEAT': 'IRON, ZINC',
    'SATTU': 'VITAMIN B12, IRON',
    'FRUIT': 'VITAMIN C, VITAMIN A',
    'SNAILS': 'VITAMIN B12, IRON',
}

# Function to analyze nutrition data for the given age and foods
def analyze_nutrition(age, selected_foods):
    unique_foods = set(selected_foods)  # Remove duplicates
    nutritional_columns = ['CALCIUM', 'IRON', 'VITAMIN A', 'VITAMIN B12', 'VITAMIN C', 'VITAMIN D', 'VITAMIN K', 'ZINC']
    results = {nutrient: 'NO' for nutrient in nutritional_columns}  # Default to 'NO'

    # Analyze selected foods and update results
    for food in unique_foods:
        if food in NUTRIENT_DATA:
            nutrients = NUTRIENT_DATA[food].split(', ')
            for nutrient in nutrients:
                if nutrient in results:
                    results[nutrient] = 'YES'

    yes_count = sum(1 for v in results.values() if v == 'YES')  # Count the 'YES' values
    return results, yes_count

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        name = request.form['name']
        locality = request.form['locality']
        age = request.form['age']
        selected_foods = request.form.getlist('foods')

        # Analyze nutrition
        results, yes_count = analyze_nutrition(age, selected_foods)

        # Save to SQLite database
        connection = db_connection()
        cursor = connection.cursor()
        query = "INSERT INTO baby_data (name, locality, age, food) VALUES (?, ?, ?, ?)"
        foods_combined = ', '.join(selected_foods)  # Combine selected foods into a string
        cursor.execute(query, (name, locality, age, foods_combined))
        connection.commit()
        cursor.close()
        connection.close()

        return render_template('results.html', name=name, locality=locality, age=age, results=results, yes_count=yes_count)

    return render_template('index.html')

if __name__ == "__main__":
    # Ensure the database is created before running the app
    create_database()  # This will create the table if it doesn't exist
    app.run(debug=True)
