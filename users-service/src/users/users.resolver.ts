import { Resolver, Query, Mutation, Args, ResolveReference } from '@nestjs/graphql';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  // Public query - no authentication required
  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.usersService.findAll();
  }

  // Gateway handles authentication - no @Auth guard here
  @Query(() => User, { name: 'user', nullable: true })
  findOne(@Args('id') id: string) {
    return this.usersService.findById(id);
  }

  // Gateway handles authentication - no @Auth guard here
  @Query(() => User, { name: 'userByEmail', nullable: true })
  findByEmail(@Args('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  // Gateway handles authentication - get user from context
  @Query(() => User, { name: 'me', nullable: true })
  getCurrentUser(@CurrentUser() user: any, @Args('id', { nullable: true }) id?: string) {
    // If user context is passed from gateway, use it; otherwise use id parameter
    const userId = user?.userId || id || '1';
    return this.usersService.findById(userId);
  }

  // Public mutation - no authentication required (for registration via gateway)
  @Mutation(() => User)
  createUser(
    @Args('name') name: string,
    @Args('email') email: string,
    @Args('role', { nullable: true }) role?: string,
  ) {
    return this.usersService.create(name, email, role);
  }

  @ResolveReference()
  resolveReference(reference: { __typename: string; id: string }) {
    return this.usersService.findById(reference.id);
  }
}
