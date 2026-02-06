import { Resolver, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthResponse } from './dto/auth-response';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';

@Resolver(() => AuthResponse)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async login(@Args('input') input: LoginInput): Promise<AuthResponse> {
    return this.authService.login(input.email, input.password);
  }

  @Mutation(() => AuthResponse)
  async register(@Args('input') input: RegisterInput): Promise<AuthResponse> {
    return this.authService.register(
      input.name,
      input.email,
      input.password,
      input.role,
    );
  }

  @ResolveField(() => String, { nullable: true })
  token(@Parent() authResponse: AuthResponse): string {
    return authResponse.accessToken;
  }
}
