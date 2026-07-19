import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

    async create (dto: CreateUserDto): Promise<User> {
        const exists = await this.userRepository.findOne({ where: { email: dto.email } });
        if (exists) {
            throw new ConflictException('User already exists');
        }
        const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);
        const user = this.userRepository.create({ ...dto, password: hashedPassword });
        return await this.userRepository.save(user);
    }
}