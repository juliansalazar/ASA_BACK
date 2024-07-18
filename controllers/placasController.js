const asyncHandler = require('express-async-handler')
const Placa = require('../models/placaModel')

const getPlacas = asyncHandler(async (req, res) => {

    const placas = await Placa.find({ user: req.user.id })

    res.status(200).json(placas)
})

const crearPlacas = asyncHandler(async (req, res) => {
    if (!req.body.placa) {
        res.status(400)
        throw new Error('No tecleaste el texto')
    }
    const placa = await Placa.create({
        placa: req.body.placa,
        brand: req.body.brand,
        model: req.body.model,
        owner: req.body.owner,
        user: req.user.id
    })
    res.status(201).json(placa)
})

const updatePlacas = asyncHandler(async (req, res) => {

    //1 verificamos que la tarea existe
    const placa = await Placa.findById(req.params.id)

    if (!placa) {
        res.status(404)
        throw new Error("La placa especificada no existe")
    }


    //2 verificamos que la tarea pertenezca al usuario logueado
    if (placa.user.toString() !== req.user.id) {
        res.status(401)
        throw new Error('Acceso no autorizado')
    } else {
        const placaUpdated = await Placa.findByIdAndUpdate(req.params.id, req.body, { new: true })
        res.status(200).json(placaUpdated)
    }
})

const deletePlacas = asyncHandler(async (req, res) => {

    //1 verificamos que la tarea existe
    const placa = await Placa.findById(req.params.id)

    if (!placa) {
        res.status(404)
        throw new Error("La tarea especificada no existe")
    }

    //2 verificamos que la tarea pertenezca al usuario logueado
    if (placa.user.toString() !== req.user.id) {
        res.status(401)
        throw new Error('Acceso no autorizado')
    } else {
        //const tareaDeleted = await Tarea.findByIdAndDelete(req.params.id)
        await placa.deleteOne()
        res.status(200).json({ id: req.params.id })
    }
})

module.exports = {
    getPlacas,
    crearPlacas,
    updatePlacas,
    deletePlacas
}
