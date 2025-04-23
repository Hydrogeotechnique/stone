let currentUser = "";

// Au chargement de la page
window.onload = function() {
  // Configuration des boutons utilisateurs
  document.querySelectorAll('.user-btn').forEach(button => {
    button.addEventListener('click', () => {
      currentUser = button.dataset.user;
      document.getElementById('userSelectScreen').style.display = 'none';
      document.getElementById('workspace').style.display = 'flex';
      
      // Charger les notes existantes
      chargerNotes();
    });
  });

  // Configuration du bouton d'ajout
  document.getElementById('addNoteButton').addEventListener('click', ajouterNote);
  
  // Configuration du bouton de suppression
  document.getElementById('deleteSelectedButton').addEventListener('click', supprimerNotes);
};

// Fonction pour ajouter une note
function ajouterNote() {
  const noteInput = document.getElementById('noteInput');
  const noteText = noteInput.value.trim();
  
  if (!noteText) {
    alert("Merci d'écrire quelque chose !");
    return;
  }
  
  // Envoyer la note au serveur
  fetch("/api/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ 
      text: noteText,
      author: currentUser
    })
  })
  .then(response => response.json())
  .then(data => {
    noteInput.value = '';  // vider le champ
    chargerNotes();        // recharger la liste
  })
  .catch(error => {
    console.error("Erreur lors de l'ajout du cailloux:", error);
  });
}

// Charger les notes depuis le serveur
function chargerNotes() {
  fetch("/api/notes")
    .then(response => response.json())
    .then(notes => {
      const notesList = document.getElementById('notesList');
      notesList.innerHTML = ''; // on vide l'affichage
      
      notes.forEach(note => {
        const div = document.createElement('div');
        div.className = `note-item ${note.author || 'unknown'}`;
        
        // Créer la case à cocher pour sélection
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = note.id;
        checkbox.className = 'note-checkbox';
        
        // Créer le nom de l'auteur
        const author = document.createElement('strong');
        if (note.author) {
          author.textContent = note.author.charAt(0).toUpperCase() + note.author.slice(1) + ': ';
        }
        
        // Créer le contenu de la note
        const content = document.createElement('span');
        content.textContent = note.text;
        
        // Assembler tous les éléments
        div.appendChild(checkbox);
        div.appendChild(author);
        div.appendChild(content);
        notesList.appendChild(div);
      });
    })
    .catch(error => {
      console.error("Erreur lors du chargement des cailloux:", error);
    });
}

// Supprimer les notes sélectionnées
function supprimerNotes() {
  const checkboxes = document.querySelectorAll('.note-checkbox:checked');
  const ids = Array.from(checkboxes).map(checkbox => parseInt(checkbox.value));
  
  if (ids.length === 0) {
    alert("Aucun cailloux sélectionné(s) !");
    return;
  }
  
  fetch("/api/notes", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ ids: ids })
  })
  .then(response => response.json())
  .then(() => {
    chargerNotes();  // recharger la liste après suppression
  })
  .catch(error => {
    console.error("Erreur lors de la suppression des cailloux:", error);
  });
}