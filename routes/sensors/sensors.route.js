import express from 'express'
import {post} from '../../controllers/sensors/sensors.controller'

const router = express.Router()

router.get('/', function(req, res) {
  res.status(400).json({error: 'Unsupported protocol'});
});

router.delete('/', function(req, res) {
  res.status(400).json({error: 'Unsupported protocol'});
});

router.put('/', function(req, res) {
  res.status(400).json({error: 'Unsupported protocol'});
});

router.route('/:id')
  .post(
    post
  )

export default router

