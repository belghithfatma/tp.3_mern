const express = require('express');

const articleRoutes = require ('./routes/articleRoutes') ;
const userRoutes = require ('./routes/userRoutes') ;
const app = express () ;
const PORT = 3000;
// Middlewares globaux
app . use( express . json () ) ; // indispensable pour lire le corps JSON (req. body )
app.use('/api/articles', articleRoutes);
// Montage du routeur sous le pré fixe ’/ api/ users ’
app.use('/api/users', userRoutes);
// Route d’accueil pour tester le statut général du serveur
app . get('/', (req , res) => {
res.json ({ message : " API du Blog2" }) ;
}) ;
app . listen (PORT , () => {
console.log(`Serveur modulaire en écoute sur http://localhost:${PORT}`);
}) ;