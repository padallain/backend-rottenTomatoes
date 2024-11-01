

class Notes {
  // Create a new note
  async createNote(req, res) {
    try {
      const { title, description, category, user, priority, favorite, card } = req.body;

      console.log(req.body)
      const newNote = new Note({
        title,
        description,
        user,
        category: category || '0',
        priority: priority || 'Low',
        favorite: favorite || false,
        card: card,
      });

      const savedNote = await newNote.save();
      res.status(201).json({ message: "Note created successfully", note: savedNote });
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(500).json({ message: "Error creating note", error: error.message });
    }
  }

  async getOneNote(req, res) {
    try {
      const { noteId } = req.params;
      const note = await Note.findById(noteId);

      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }

      res.status(200).json(note);
    } catch (error) {
      console.error("Error fetching note:", error);
      res.status(500).json({ message: "Error fetching note", error: error.message });
    }
  }

  // Get all notes for a specific user
  async getNotes(req, res) {
    try {
      const { userId } = req.params;
      const notes = await Note.find({ user: userId });
      res.status(200).json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ message: "Error fetching notes", error: error.message });
    }
  }

  // Update a note by ID
  async updateNote(req, res) {
    try {
      const { noteId } = req.params;
      const { title, description, category, priority, favorite } = req.body;
      const updatedNote = await Note.findByIdAndUpdate(
        noteId,
        { title, description, category, priority, favorite },
        { new: true } // Return the updated document
      );
      if (!updatedNote) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.status(200).json({ message: "Note updated successfully", note: updatedNote });
    } catch (error) {
      console.error("Error updating note:", error);
      res.status(500).json({ message: "Error updating note", error: error.message });
    }
  }

  // Delete a note by ID
  async deleteNote(req, res) {
    try {
      const { noteId } = req.params;
      const deletedNote = await Note.findByIdAndDelete(noteId);
      if (!deletedNote) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
      console.error("Error deleting note:", error);
      res.status(500).json({ message: "Error deleting note", error: error.message });
    }
  }
}

module.exports = new Notes();
