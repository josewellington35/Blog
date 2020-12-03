const express = require("express")
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport = require("passport")
const nodemailer = require("nodemailer");

router.get('/modal', (req, res) => {
    res.render("usuarios/modal")
})

router.post('/verAdmin', (req, res) => {
    if (req.body.cod == "412341") {

        res.render("admin/registro")
    } else {
        req.flash("error_msg", "Erro, algo deu errado")
        res.render("usuarios/modal")
        req.flash("error_msg","Erro, algo deu errado")
    }



})
router.post('/serAdmin', (req, res) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: true,
        auth: {
            user:"jw3996528@gmail.com",
            pass:"96588268"
        }

    });

    const novoUsuario = new Usuario({

        nome: req.body.nome,
        email: req.body.email,
        senha: req.body.senha,
        eAdmin: req.body.nivelAcesso
    })

    transporter.sendMail({
   
        from: " Sr. José Wellington <jw3996528@gmail.com>",
        to: novoUsuario.email ,
        subject: "Seu Cod chegou",
        text: "Seu codígo é 412341",
        html: "........HTML........"
    }).then(() => {
        req.flash('success_msg', "Sucesso")
        console.log("Enviado")
        res.render("usuarios/serAdmin")
        }).catch(err => {
            req.flash("error_msg", "Erro ")

            res.render("usuarios/serAdmin")


        })



})

router.get('/login', (req, res) => {
    res.render("usuarios/login")
})
router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true

    })(req, res, next)


})
router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success_msg', "Deslogado com sucesso!")
    res.redirect("/")
})


router.get("/registro", (req, res) => {
    res.render("usuarios/registro")


})
router.post("/registro", (req, res) => {



    var erros = []


    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: "Nome Inválido"})

    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: "Email Inválido" })

    }
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: "Senha Inválido" })

    }
    if (req.body.senha.length < 4) {
        erros.push({ texto: "Senha muito curta" })

    }
    if (req.body.senha != req.body.senha2) {
        erros.push({ texto: "As senhas são diferentes" })

    }
    if (erros.length > 0) {
        res.render("usuarios/registros", {erros: erros} )


    } else {
        Usuario.findOne({ email: req.body.email }).then((usuario) => {
            if (usuario) {
                req.flash("error_msg", "Já existe uma conta como este e-mail ")
                res.redirect("/usuarios/registro")
            } else {

                const novoUsuario = new Usuario({

                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                    eAdmin: 1//req.body.nivelAcesso
                })

                bcrypt.genSalt(10, (erro, salt) => {

                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {

                        if (erro) {

                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário")
                            res.redirect("/")
                        }

                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuário criado com sucesso")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro ao criar o usuário, tente novamente!")
                            res.redirect("/usuarios/registro")

                            })

                    })

                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")

            })
  

    }


})

module.exports = router