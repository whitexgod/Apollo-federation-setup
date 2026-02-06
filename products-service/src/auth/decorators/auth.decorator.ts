import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';

export const Auth = () => UseGuards(GqlAuthGuard);
