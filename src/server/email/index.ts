import ejs from "ejs";
import { log } from "../utils";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import path from "path";
import getConfig from "next/config";

const ses = new SESv2Client({
  region: "us-east-2",
});

export interface ReceiptData {
  name: string;
  transactionHash: string;
  paymentMethod: string;
  dateTime: string;
  amount: number | string;
  fee: number;
  partnerId?: string;
  partnerOrderId?: string;
  orderLink?: string;
  partnerName?: string;
}

class EmailService {
  async sendReceiptEmail(emailAddress: string, data: ReceiptData) {
    try {
      const template = path.join(
        getConfig().serverRuntimeConfig.PROJECT_ROOT,
        "/public/static/templates/receipt.ejs"
      );
      const emailString = await ejs.renderFile(template, data);
      const command = new SendEmailCommand({
        FromEmailAddress: "tools@jxndao.com",
        Destination: {
          ToAddresses: [emailAddress],
        },
        Content: {
          Simple: {
            Subject: {
              Data: data.partnerName
                ? `MyBackpack Receipt - ${data.partnerName} Purchase`
                : "MyBackpack Receipt",
            },
            Body: {
              Html: {
                Data: emailString,
              },
            },
          },
        },
      });
      await ses.send(command);
    } catch (err) {
      log.warn({
        func: "sendReceiptEmail",
        err,
      });
    }
  }
}

export const emailService = new EmailService();
