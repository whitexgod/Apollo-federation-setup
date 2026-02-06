import { ObjectType, Field, ID, Directive } from '@nestjs/graphql';

@ObjectType()
@Directive('@key(fields: "id")')
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  role?: string;

  @Field({ nullable: true })
  createdAt?: Date;

  // Password is not exposed in GraphQL schema
  password?: string;

  // Refresh token is not exposed in GraphQL schema
  refreshToken?: string;
}
