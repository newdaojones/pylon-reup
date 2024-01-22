import { Field, ID, ObjectType } from "type-graphql";
import { CheckoutStep } from "./checkoutStep.type";
import { PaidStatus } from "./paidStatus.type";

@ObjectType()
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
