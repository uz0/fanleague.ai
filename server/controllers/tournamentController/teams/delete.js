import mongoose from 'mongoose';
import pick from 'lodash/pick';
import defaults from 'lodash/defaults';
import { param, check, validationResult } from 'express-validator/check';

import { isEntityExists } from '../../validators';
import { withValidationHandler } from '../../helpers';
import TeamModel from '../../../models/team';

const validator = [
  param('teamId').custom(id => isEntityExists(id, TeamModel)),
];

const handler = withValidationHandler(async (req, res) => {
  await TeamModel.remove({ _id: req.params.teamId });
  res.json({ success: true });
});

export { validator, handler };
