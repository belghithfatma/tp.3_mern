const User = require('../models/userModel');
const { estNonVide, estEmailValide } = require('../utils/validators');
const articleController = require('./articleController');

// 1. Créer un utilisateur (POST /api/users)
const createUser = async (req, res) => {
  try {
    const { name, email, age, role } = req.body;

    // Validation du nom
    if (!estNonVide(name)) {
      return res.status(400).json({
        message: 'Le nom est obligatoire et ne doit pas être vide'
      });
    }

    // Validation de l'email
    if (!estEmailValide(email)) {
      return res.status(400).json({
        message: "L'email est invalide et l'age minimum est de 4 ans"
      });
    }

    // Vérification du doublon d'email
    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(409).json({
        message: 'Cet email est déjà utilisé'
      });
    }

    // Création dans MongoDB
    const user = await User.create({
      name,
      email,
      age,
      role: role || 'user'
    });

    return res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// 2. Obtenir tous les utilisateurs (GET /api/users)
// Filtrage facultatif par rôle : /api/users?role=admin
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filtre = role ? { role } : {};

    const users = await User.find(filtre);

    return res.status(200).json({
      total: users.length,
      users
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// 3. Obtenir un utilisateur par ID (GET /api/users/:id)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'Utilisateur non trouvé'
      });
    }

    return res.status(200).json(user);
  } catch (err) {
    return res.status(400).json({
      message: 'Identifiant utilisateur invalide'
    });
  }
};

// 4. Supprimer un utilisateur (DELETE /api/users/:id)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: `Impossible de supprimer : utilisateur ${req.params.id} introuvable`
      });
    }

    return res.status(200).json({
      message: 'Utilisateur supprimé avec succès',
      user
    });
  } catch (err) {
    return res.status(400).json({
      message: 'Identifiant utilisateur invalide'
    });
  }
};

// 5. Obtenir les articles d'un utilisateur par email
const getArticlesByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!estEmailValide(email)) {
      return res.status(400).json({
        message: 'Veuillez fournir un email valide : ?email=...'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: `Aucun utilisateur avec l'email ${email}`
      });
    }

    const articles = articleController.getArticlesByAuthor(user.name);

    return res.status(200).json({
      user,
      total: articles.length,
      articles
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  deleteUser,
  getArticlesByEmail
};