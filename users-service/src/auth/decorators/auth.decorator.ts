import { UseGuards, SetMetadata } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';

export const Auth = () => UseGuards(GqlAuthGuard);
export const Public = () => SetMetadata('isPublic', true);
