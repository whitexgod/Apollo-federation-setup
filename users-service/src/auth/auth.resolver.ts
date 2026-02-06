import { Resolver, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthResponse } from './dto/auth-response';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { RefreshTokenInput } from './dto/refresh-token.input';
import { Public } from './decorators/auth.decorator';

@Resolver(() => AuthResponse)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => AuthResponse)
  async login(@Args('input') input: LoginInput): Promise<AuthResponse> {
    return this.authService.login(input.email, input.password);
  }

  @Public()
  @Mutation(() => AuthResponse)
  async register(@Args('input') input: RegisterInput): Promise<AuthResponse> {
    return this.authService.register(input.name, input.email, input.password, input.role);
  }

  @Public()
  @Mutation(() => AuthResponse)
  async refreshToken(@Args('input') input: RefreshTokenInput): Promise<AuthResponse> {
    return this.authService.refreshAccessToken(input.refreshToken);
  }

  @ResolveField(() => String, { nullable: true })
  token(@Parent() authResponse: AuthResponse): string {
    return authResponse.accessToken;
  }
}
