from flask import Flask, render_template, jsonify, request
import psycopg2
from psycopg2.extras import RealDictCursor
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DB_CONFIG = {
    "dbname": "my_app_db",
    "user": "postgres",
    "password": "7575",
    "host": "localhost",
    "port": "5432"
}

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/columns')
def get_all_columns():
    """Получить все названия столбцов таблицы"""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'razuediniteli'
        """)
        columns = [row[0] for row in cur.fetchall()]
        return jsonify(columns)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/data', methods=['POST'])
def get_filtered_data():
    """Получить данные с фильтрами"""
    try:
        filters = request.json.get('filters', [])
        selected_columns = request.json.get('selectedColumns', [])
        
        # Формируем SQL-запрос
        query = "SELECT "
        query += ", ".join(selected_columns) if selected_columns else "*"
        query += " FROM razuediniteli WHERE 1=1"
        
        params = []
        for f in filters:
            if f['column'] and f['value']:
                query += f" AND {f['column']} ILIKE %s"
                params.append(f"%{f['value']}%")
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(query, params)
        data = cur.fetchall()
        
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)