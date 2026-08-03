import { Router } from 'express';
import { listHashtags } from './hashtags.controller';
import { listHashtagsSchema } from './hashtags.schema';
import { validate } from '../../middleware/validate';

const router = Router();

router.get('/', validate(listHashtagsSchema), listHashtags);

export default router;
