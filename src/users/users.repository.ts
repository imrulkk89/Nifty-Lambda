import { Injectable } from '@nestjs/common';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
//import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  private readonly tableName = process.env.DYNAMODB_TABLE_NAME;
  private readonly client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient({});
  }

  async findAll(): Promise<any> {
    const command = new ScanCommand({
      TableName: this.tableName,
    });

    const { Items } = await this.client.send(command);

    return Items.map((item) => {
      const data = unmarshall(item);
      return {
        ...data,
        createdAt: new Date(Number(data.createdAt)),
        updatedAt: new Date(Number(data.updatedAt)),
      };
    });
  }
}
