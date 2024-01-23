import { Field, ObjectType } from "type-graphql";

@ObjectType("TransactionType")
export class TransactionType {
  @Field()
  checkoutId: string;

  @Field()
  step: string;

  @Field()
  status: string;

  @Field()
  paidStatus: string;

  @Field()
  message: string;

  @Field({ nullable: null })
  transactionId!: string;

  @Field()
  date: Date;
}
