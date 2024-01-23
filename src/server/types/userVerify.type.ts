import { Field, ID, ObjectType } from "type-graphql";

@ObjectType("UserVerifyType")
export class UserVerifyType {
  @Field()
  userId: string;

  @Field()
  status: string;

  @Field({ nullable: null })
  error!: string;

  @Field({ nullable: null })
  token!: string;
}
