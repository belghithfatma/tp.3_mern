const User = require('../models/userModel');
const Article = require('../models/articleModel'); // AJOUT : nécessaire pour deleteUser
const { estNonVide, estEmailValide } = require('../utils/validators');
const articleController = require('./articleController');

// AJOUT : gestion centralisée des erreurs
const handleError = (err, res) => {
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Identifiant de ressource invalide (format ObjectId attendu)'
    });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Cet email est déjà utilisé' });
  }
  return res.status(500).json({ message: err.message });
};

// 1. Créer un utilisateur (POST /api/users)
const createUser = async (req, res) => {
  try {
    const { name, email, age, role, bio, phone } = req.body;

    if (!estNonVide(name)) {
      return res.status(400).json({
        message: 'Le nom est obligatoire et ne doit pas être vide'
      });
    }

    if (!estEmailValide(email)) {
      return res.status(400).json({
        message: "L'email est invalide"
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({
        message: 'Cet email est déjà utilisé'
      });
    }

    const user = await User.create({
      name,
      email,
      age,
      role: role || 'user',
      bio,
      phone
    });

    return res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user
    });
  } catch (err) {
    return handleError(err, res); // MODIF : ValidationError => 400 au lieu de 500
  }
};

// 2. Obtenir tous les utilisateurs (GET /api/users)
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
    return handleError(err, res);
  }
};

// 3. Obtenir un utilisateur par ID (GET /api/users/:id)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    return res.status(200).json(user);
  } catch (err) {
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Identifiant de ressource invalide (format ObjectId attendu)'
    });
  }
  return res.status(500).json({ message: err.message });
};
};

// 4. Supprimer un utilisateur (DELETE /api/users/:id)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérification d'intégrité relationnelle
    const hasArticles = await Article.findOne({ author: id });
    if (hasArticles) {
      return res.status(400).json({
        message: 'Impossible de supprimer un utilisateur ayant des articles publies'
      });
    }

    await User.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Utilisateur supprimé avec succès', id });
  } catch (err) {
    return handleError(err, res);
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
    return handleError(err, res);
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  deleteUser,
  getArticlesByEmail
};