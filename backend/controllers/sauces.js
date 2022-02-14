const Sauce = require("../models/Sauce");
const fs = require("fs");
const jwt = require("jsonwebtoken");
// Récupération de la liste de toutes les sauces
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({
        message: error.message,
      });
    });
};

// Création d'un post d'une sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
    .catch((error) => res.status(400).json({ message: error.message }));
};

// Modification d'une sauce
exports.modifySauce = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
  const userId = decodedToken.userId;

  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId == userId) {
        const sauceObject = req.file
          ? {
              ...JSON.parse(req.body.sauce),
              imageUrl: `${req.protocol}://${req.get("host")}/images/${
                req.file.filename
              }`,
            }
          : { ...req.body };
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
          .catch((error) => res.status(400).json({ message: error.message }));
      } else {
        res.status(403).json({ message: "Utilisateur non authorisé !" });
      }
    })
    .catch((error) => res.status(500).json({ message: error.message }));
};

// Suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
  const userId = decodedToken.userId;

  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId == userId) {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
            .catch((error) => res.status(400).json({ message: error.message }));
        });
      } else {
        res.status(403).json({ message: "Utilisateur non authorisé !" });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

// Faire apparaître une unique sauce
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({
        message: error.message,
      });
    });
};

// Like / Dislike programmation
exports.likeDislike = (req, res, next) => {
  if (req.body.like === 1) {
    Sauce.updateOne(
      { _id: req.params.id },
      {
        $inc: { likes: req.body.like++ },
        $push: { usersLiked: req.body.userId },
      }
    )
      .then((sauce) => res.status(200).json({ message: "Like ajouté !" }))
      .catch((error) => res.status(400).json({ message: error.message }));
  } else if (req.body.like === -1) {
    Sauce.updateOne(
      { _id: req.params.id },
      {
        $inc: { dislikes: req.body.like++ * -1 },
        $push: { usersDisliked: req.body.userId },
      }
    )
      .then((sauce) => res.status(200).json({ message: "Dislike ajouté !" }))
      .catch((error) => res.status(400).json({ error }));
  } else {
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        if (sauce.usersLiked.includes(req.body.userId)) {
          Sauce.updateOne(
            { _id: req.params.id },
            { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } }
          )
            .then((sauce) => {
              res.status(200).json({ message: "Like supprimé !" });
            })
            .catch((error) => res.status(400).json({ error }));
        } else if (sauce.usersDisliked.includes(req.body.userId)) {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $pull: { usersDisliked: req.body.userId },
              $inc: { dislikes: -1 },
            }
          )
            .then((sauce) => {
              res.status(200).json({ message: "Dislike supprimé !" });
            })
            .catch((error) => res.status(400).json({ message: error.message }));
        }
      })
      .catch((error) => res.status(400).json({ message: error.message }));
  }
};
