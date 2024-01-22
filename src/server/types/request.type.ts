import { NextApiRequest } from "next";
import { Partner } from "../models/Partner";

interface User {
  id?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
}

export interface CustomNextApiRequest extends NextApiRequest {
  partner?: Partner;
  user?: User;
}
