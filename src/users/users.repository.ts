import { Injectable } from '@nestjs/common';
import {
  DynamoDBClient,
  ScanCommand,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository {
  private readonly tableName = process.env.DYNAMODB_TABLE_NAME;
  private readonly client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient({});
  }

  async create(data: CreateUserDto): Promise<any> {
    const user: User = {
      userId: uuidv4(),
      name: data.name,
      email: data.email,
      createdAt: Number(new Date()),
      updatedAt: Number(new Date()),
    };

    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: marshall(user) || {},
    });

    return await this.client.send(command);
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

  async findById(id: string): Promise<any> {
    const command = new GetItemCommand({
      TableName: this.tableName,
      Key: marshall({ userId: id }),
    });

    const { Item } = await this.client.send(command);
    let user = Item ? unmarshall(Item) : {};

    if (Object.keys(user).length !== 0) {
      user = {
        ...user,
        createdAt: new Date(Number(user.createdAt)),
        updatedAt: new Date(Number(user.updatedAt)),
      };
    }

    return user;
  }

  async update(id: string, data: UpdateUserDto): Promise<any> {
    const body = {
      ...data,
      updatedAt: Number(new Date()),
    };
    const objKeys = Object.keys(body);

    const command = new UpdateItemCommand({
      TableName: this.tableName,
      Key: marshall({ userId: id }),
      UpdateExpression: `SET ${objKeys
        .map((_, index) => `#key${index} = :value${index}`)
        .join(', ')}`,
      ExpressionAttributeNames: objKeys.reduce(
        (acc, key, index) => ({
          ...acc,
          [`#key${index}`]: key,
        }),
        {},
      ),
      ExpressionAttributeValues: marshall(
        objKeys.reduce(
          (acc, key, index) => ({
            ...acc,
            [`:value${index}`]: body[key],
          }),
          {},
        ),
      ),
    });

    return await this.client.send(command);
  }

  async deleteById(id: string): Promise<any> {
    const command = new DeleteItemCommand({
      TableName: this.tableName,
      Key: marshall({ userId: id }),
    });

    return await this.client.send(command);
  }
}
