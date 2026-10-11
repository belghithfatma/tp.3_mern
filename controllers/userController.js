const { estNonVide, estEmailValide } = require('../utils/validators');
const articleController = require('./articleController');
let users = [
{ id: 1 , name : 'Aymen ' , email : 'aymen@gmail.com' , role : 'admin' } ,
{ id: 2 , name : 'Lina ' , email : 'lina@gmail.com' , role : 'user' } ,
];
const getAllUsers = (req , res) => {
const { role } = req. query ;
let resultat = users ;
if ( role ) {
resultat = users . filter (u => u. role === role ) ;
}
res . status (200) . json ({ total : resultat . length , users : resultat }) ;
};

const getUserById = (req , res) => {
const id = Number ( req. params .id) ;
const user = users . find (u => u.id === id) ;
if (! user ) {
return res. status (404) . json ({ error : `User ${id} introuvable` }) ;
}
res . status (200) . json ( user ) ;
};
let prochainId = 3;
const createUser = (req, res) => {
  const { name, email, role } = req.body;
  if (!estNonVide(name)) {
    return res.status(400).json({ error: 'Le nom est obligatoire et ne doit pas être vide' });
  }
  if (!estEmailValide(email)) {
    return res.status(400).json({ error: "L'email est invalide : il doit contenir '@' et '.'" });
  }
  const nouvelUser = { id: prochainId++, name, email, role: role || 'user' };
  users.push(nouvelUser);
  res.status(201).json({ message: 'Utilisateur créé', user: nouvelUser });
};

const deleteUser = (req , res) => {
const id = Number ( req. params .id) ;
const userExiste = users . some (u => u.id === id) ;
if (! userExiste ) {
return res. status (404) . json ({ error : `Impossible de supprimer : user ${id} introuvable` }) ;
}
users = users . filter (u => u.id !== id) ;
res . status (200) . json ({ message : `User ${id} supprimé avec succès` }) ;
};
const getArticlesByEmail = (req, res) => {
  const { email } = req.query;
  if (!estEmailValide(email)) {
    return res.status(400).json({ error: 'Veuillez fournir un email valide : ?email=...' });
  }
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ error: `Aucun utilisateur avec l'email ${email}` });
  }
  const articlesUser = articleController.getArticlesByAuthor(user.name);
  res.status(200).json({ user, total: articlesUser.length, articles: articlesUser });
};

module . exports = {
getAllUsers ,
getUserById ,
createUser ,
deleteUser,
getArticlesByEmail
};
