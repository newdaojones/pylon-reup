import { Resolver, Query, Authorized, Ctx } from "type-graphql";

@Resolver()
export class UserResolver {
  @Authorized()
  @Query(() => String, { nullable: true })
  async me(@Ctx("user") user: any) {
    return user;
  }
}
