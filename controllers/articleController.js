const Article = require('../models/articleModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

// GET /api/articles
// Récupérer tous les articles, avec filtre optionnel par auteur
const getAllArticles = async (req, res) => {
  try {
    const { author } = req.query;
    const filtre = {};

    if (author) {
      if (!mongoose.Types.ObjectId.isValid(author)) {
        return res.status(400).json({
          error: 'Identifiant auteur invalide'
        });
      }

      filtre.author = author;
    }

    const articles = await Article.find(filtre)
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      total: articles.length,
      articles
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

// GET /api/articles/:id
// Récupérer un article par son identifiant MongoDB
const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Identifiant article invalide'
      });
    }

    const article = await Article.findById(id)
      .populate('author', 'name email');

    if (!article) {
      return res.status(404).json({
        error: `Article ${id} introuvable`
      });
    }

    res.status(200).json(article);
  }  catch (err) {
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Identifiant de ressource invalide (format ObjectId attendu)'
    });
  }
  return res.status(500).json({ message: err.message });
};
};

// POST /api/articles
// Créer un article
const createArticle = async (req, res) => {
  try {
    const { title, content, authorId } = req.body;

    if (
      !title?.trim() ||
      !content?.trim() ||
      !authorId
    ) {
      return res.status(400).json({
        error: 'Le titre, le contenu et l’auteur sont obligatoires'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(authorId)) {
      return res.status(400).json({
        error: 'Identifiant auteur invalide'
      });
    }

    const user = await User.findById(authorId);

    if (!user) {
      return res.status(404).json({
        error: 'Auteur introuvable'
      });
    }

    const article = await Article.create({
      title: title.trim(),
      content: content.trim(),
      author: user._id
    });

    const articleCree = await Article.findById(article._id)
      .populate('author', 'name email');

    res.status(201).json({
      message: 'Article créé avec succès',
      article: articleCree
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: error.message
      });
    }

    res.status(500).json({
      error: error.message
    });
  }
};

// PUT /api/articles/:id
// Modifier un article
const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, authorId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Identifiant article invalide'
      });
    }

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        error: 'Article introuvable'
      });
    }

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({
          error: 'Le titre ne peut pas être vide'
        });
      }

      article.title = title.trim();
    }

    if (content !== undefined) {
      if (typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({
          error: 'Le contenu ne peut pas être vide'
        });
      }

      article.content = content.trim();
    }

    if (authorId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(authorId)) {
        return res.status(400).json({
          error: 'Identifiant auteur invalide'
        });
      }

      const user = await User.findById(authorId);

      if (!user) {
        return res.status(404).json({
          error: 'Auteur introuvable'
        });
      }

      article.author = user._id;
    }

    await article.save();

    const articleMisAJour = await Article.findById(article._id)
      .populate('author', 'name email');

    res.status(200).json({
      message: 'Article mis à jour avec succès',
      article: articleMisAJour
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: error.message
      });
    }

    res.status(500).json({
      error: error.message
    });
  }
};

// DELETE /api/articles/:id
// Supprimer un article
const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Identifiant article invalide'
      });
    }

    const article = await Article.findByIdAndDelete(id);

    if (!article) {
      return res.status(404).json({
        error: 'Article introuvable'
      });
    }

    res.status(200).json({
      message: 'Article supprimé avec succès',
      article
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

// Récupérer les articles d'un auteur
const getArticlesByAuthor = async (authorId) => {
  if (!mongoose.Types.ObjectId.isValid(authorId)) {
    return [];
  }

  return Article.find({ author: authorId })
    .populate('author', 'name email')
    .sort({ createdAt: -1 });
};

module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticlesByAuthor
};
