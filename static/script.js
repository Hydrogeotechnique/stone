// Fonction appelée au chargement de la page
window.onload = function() {
    chargerNotes();
  };
  
  // Ajouter une note
  function ajouterNote() {
    const input = document.getElementById("noteInput");
    const text = input.value.trim();
  
    if (text === "") return;
  
    fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text: text })
    })
    .then(response => response.json())
    .then(data => {
      input.value = "";  // vider le champ
      chargerNotes();    // recharger la liste
    });
  }
  
  // Charger les notes depuis le serveur
  function chargerNotes() {
    fetch("/api/notes")
      .then(response => response.json())
      .then(notes => {
        const notesList = document.getElementById("notesList");
        notesList.innerHTML = ""; // on vide l'affichage
  
        notes.forEach(note => {
          const div = document.createElement("div");
          div.className = "note-item";
  
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.value = note.id;
  
          const span = document.createElement("span");
          span.textContent = note.text;
  
          div.appendChild(checkbox);
          div.appendChild(span);
          notesList.appendChild(div);
        });
      });
  }
  
  // Supprimer les notes cochées
  function supprimerNotes() {
    const checkboxes = document.querySelectorAll("#notesList input[type=checkbox]:checked");
    const ids = Array.from(checkboxes).map(cb => parseInt(cb.value));
  
    if (ids.length === 0) return;
  
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
    });
  }
  