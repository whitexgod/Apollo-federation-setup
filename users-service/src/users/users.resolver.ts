import { Resolver, Query, Mutation, Args, ResolveReference } from '@nestjs/graphql';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateUserInput } from './dto/update-user.input';

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

  // Gateway handles authentication
  @Mutation(() => User, { nullable: true })
  updateUser(
    @Args('id') id: string,
    @Args('input') input: UpdateUserInput,
  ) {
    return this.usersService.update(id, input.name, input.email, input.role);
  }

  // Gateway handles authentication
  @Mutation(() => Boolean)
  deleteUser(@Args('id') id: string) {
    return this.usersService.delete(id);
  }

  @ResolveReference()
  resolveReference(reference: { __typename: string; id: string }) {
    return this.usersService.findById(reference.id);
  }
}
