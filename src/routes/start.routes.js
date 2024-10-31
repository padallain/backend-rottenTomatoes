const express = require('express');
const { register, createLogin, resetPassword, checkResetToken,savePassword, eraseAccount } = require('../controllers/auth.controllers');
const router = express.Router();
const Notes = require('../controllers/notes.controllers'); 
const categoryController = require('../controllers/category.controllers');

router.use(express.json()); 

// Auth routes
router.get('/', (req, res) => {
  res.send('You have to log in.');
});
router.post('/register', register);
router.post('/login', createLogin);
router.post('/resetPassword', resetPassword);
router.post('/checkReset', checkResetToken);
router.post('/newPassword', savePassword);
router.delete('/deleteUser', eraseAccount)

// Notes routes
router.get('/getNotes/:userId', Notes.getNotes.bind(Notes)); // Get notes for a specific user
router.get('/getOneNote/:noteId', Notes.getOneNote.bind(Notes)); // Get a single note by ID
router.post('/createNote', Notes.createNote.bind(Notes)); // Create a new note
router.put('/updateNote/:noteId', Notes.updateNote.bind(Notes)); // Update a note by ID
router.delete('/deleteNote/:noteId', Notes.deleteNote.bind(Notes)); // Delete a note by ID

//Category routes
router.post('/createCategory', categoryController.createCategory);
router.get('/getCategories', categoryController.getCategories);
router.put('/updateCategory/:categoryId', categoryController.updateCategory);
router.delete('/deleteCategory/:categoryId', categoryController.deleteCategory);



module.exports = router;
