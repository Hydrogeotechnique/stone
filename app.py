from flask import Flask, render_template, request, jsonify
import os
import json
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

app = Flask(__name__)

# Configuration de la base de données
DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///notes.db')  # PostgreSQL en prod, SQLite en local
if DATABASE_URL.startswith('postgres://'):  # Fix pour Heroku/Render
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

# Configuration SQLAlchemy
engine = create_engine(DATABASE_URL)
Base = declarative_base()
Session = sessionmaker(bind=engine)

# Modèle de données
class Note(Base):
    __tablename__ = 'notes'
    
    id = Column(Integer, primary_key=True)
    text = Column(Text, nullable=False)
    
    def to_dict(self):
        return {
            "id": self.id,
            "text": self.text
        }

# Créer les tables si elles n'existent pas
Base.metadata.create_all(engine)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/notes', methods=['GET', 'POST', 'DELETE'])
def handle_notes():
    session = Session()
    
    try:
        if request.method == 'GET':
            notes = session.query(Note).all()
            return jsonify([note.to_dict() for note in notes])

        elif request.method == 'POST':
            data = request.get_json()
            note_text = data.get('text', '').strip()
            
            if note_text:
                new_note = Note(text=note_text)
                session.add(new_note)
                session.commit()
                return jsonify(new_note.to_dict()), 201
            
            return jsonify({"error": "Note vide"}), 400

        elif request.method == 'DELETE':
            data = request.get_json()
            ids_to_delete = data.get('ids', [])
            
            for note_id in ids_to_delete:
                note = session.query(Note).filter(Note.id == note_id).first()
                if note:
                    session.delete(note)
            
            session.commit()
            return jsonify({"status": "supprimé"}), 200
            
    except Exception as e:
        session.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 10000)), debug=True)