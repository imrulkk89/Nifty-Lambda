import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly repository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    const result = await this.repository.create(createUserDto);
    return {
      httpstatusCode: result.$metadata.httpStatusCode,
    };
  }

  async findAll(): Promise<any> {
    const result = await this.repository.findAll();
    return {
      httpStatusCode: result.$metadata.httpStatusCode || 200,
      data: result,
    };
  }

  async findOne(id: string): Promise<any> {
    const result = await this.repository.findById(id);
    return {
      httpStatusCode: result.$metadata.httpStatusCode || 200,
      data: result,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<any> {
    const result = await this.repository.update(id, updateUserDto);
    return {
      httpStatusCode: result.$metadata.httpStatusCode,
    };
  }

  async remove(id: string): Promise<any> {
    const result = await this.repository.deleteById(id);
    return {
      httpStatusCode: result.$metadata.httpStatusCode,
    };
  }
}
