import express from 'express';

import { validator as validateCreate, handler as create } from './create';
import { validator as validateEdit, handler as edit } from './edit';
import { validator as validateDelete, handler as deleteHandler } from './delete';
import * as createResults from './createResults';
import { validator as validateEditResults, handler as editResults } from './editResults';
import { validator as validateGet, handler as get } from './get';

const router = express.Router({
  mergeParams: true
});

const MatchController = () => {
  router.post('/', validateCreate, create);

  router.get('/:matchId', validateGet, get);

  router.put('/:matchId', validateEdit, edit);

  router.delete('/:matchId', validateDelete, deleteHandler);

  router.post('/:matchId/results', createResults.validator, createResults.handler);

  router.put('/:matchId/results', validateEditResults, editResults);

  return router;
}

export default MatchController;