import { SetMetadata } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export const ACTOR_TYPE_KEY = 'actorType';

export const ActorType = (...types: Array<JwtPayload['type']>) =>
  SetMetadata(ACTOR_TYPE_KEY, types);
