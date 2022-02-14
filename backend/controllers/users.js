const bcrypt = require("bcrypt");

// Importation de chiffrage mail crypto-js
const cryptojs = require("crypto-js");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Signup
// Hashage du mdp : je voulais voir ce que ça faisait à 40, mais je l'ai remis à 10 du coup ;)
exports.signup = (req, res, next) => {
  console.log(req.body.password);

  // Chiffrage de l'email avant de l'envoyer dans la base de données
  const emailCryptoJs = cryptojs
    .HmacSHA256(req.body.email, "CLE_SECRETE")
    .toString();

  console.log(emailCryptoJs);

  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: emailCryptoJs,
        password: hash,
      });

      console.log(JSON.stringify(user));
      user
        .save()
        .then(() =>
          res.status(201).json({
            message: "Un nouvel utilisateur a fait son apparition !",
          })
        )
        .catch((error) => {
          console.log("erreur : " + error.message);
          res.status(400).json({ message: error.message });
        });
    })
    .catch((error) => {
      console.log("erreur : " + error.message);
      res.status(500).json({ message: error.message });
    });
};

// Connexion
exports.login = (req, res, next) => {
  // Chiffrage de l'email avant de l'envoyer dans la base de données
  const emailCryptoJs = cryptojs
    .HmacSHA256(req.body.email, "CLE_SECRETE")
    .toString();

  User.findOne({ email: emailCryptoJs })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res
              .status(401)
              .json({ message: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
              expiresIn: "10h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ message: error.message }));
    })
    .catch((error) => res.status(500).json({ message: error.message }));
};
