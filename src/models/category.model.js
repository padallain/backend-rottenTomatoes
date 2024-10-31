const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Definir el esquema de la categoría
const categorySchema = new Schema(
  {
    title: {
      type: String,
      required: true, // El título es requerido
      trim: true,     // Elimina espacios innecesarios
    },
    notes: [
      {
        type: mongoose.Schema.Types.ObjectId, // Referencia a las notas asociadas
        ref: 'Note',                         // Relacionar con el modelo de notas
      },
    ],
  },
  {
    timestamps: true,  // Agrega automáticamente createdAt y updatedAt
  }
);

// Crear y exportar el modelo de Categoría
module.exports = mongoose.model('Category', categorySchema);
