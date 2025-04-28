import { TransactionRecorderFile } from "@/modules/transactions-recording/repositories/transaction-recorder-file";
import { TransactionRecorderRepo } from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

/**
 * TODO:
 * Replace with DynamoDB
 * TODO:
 * Document that this file in fork can be replaced with a different DB
 */
export const transactionRecorder: TransactionRecorderRepo = new TransactionRecorderFile();
