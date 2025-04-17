import { TransactionRecorderFile } from "@/modules/transactions-recording/transaction-recorder-file";

/**
 * TODO:
 * Replace with DynamoDB
 * TODO:
 * Document that this file in fork can be replaced with a different DB
 */
export const transactionRecorder = new TransactionRecorderFile();
