const mongoose = require('mongoose');
const config = require('../../../config/config');
const Promo = require('../../../models/promo');

const controller = {
    index: (req, res, next) => {
        Promo
            .find({})
            .exec((err, data) => {
                if (err) return next(err);

                if (!data || data.length <= 0) {
                    res.status(422).send('Promo not found');
                } else {
                    res.status(200).send(data);
                }
            })
    },
    add: (req, res, next) => {
        const { promoCode, isPercent, amount, isActive } = req.body;

        Promo.findOne({promoCode : req.body.promoCode}, (err, promo) => {
            if(promo) {
                return res.status(422).send({
                    formError: 'Promo exist'
                });
            }

            let promotion = new Promo({
                promoCode,
                isPercent,
                amount,
                isActive
            })

            promotion.save((err, data) => {
                if(err) return next(err);
                res.status(200).send('Promo saved successfully');
            })
        })
    },
    read: (req, res, next) => {
        Promo
            .findById(req.params.id)
            .exec((err, data) => {
                if (err) return next(err);
                res.status(200).send(data);
            })
    },
    update: (req, res, next) => {
        const { promoCode, isPercent, amount, isActive } = req.body;

        Promo.findByIdAndUpdate(req.params.id, {
            $set: {
                promoCode,
                isPercent,
                amount,
                isActive
            }
        }, (err, data) => {
            if (err) return next(err);
            res.status(200).send('Promo updated.');
        });
    },
    delete: (req, res, next) => {
        Promo.findOneAndRemove({_id: req.params.id}, (err) => {
            if (err)
                return next(err);

            res.status(200).send('Promo details deleted successfully!');
        });
    }
}

module.exports = controller;