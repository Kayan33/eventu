import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from "./users.controller";
import { UserService } from "./users.service";
import { User } from "./entities/user.entity";
import { Module } from "@nestjs/common";



@Module({
    controllers: [UserController],
    providers: [UserService],
    imports: [TypeOrmModule.forFeature([User])],
    exports: [UserService],
})
export class UserModule {}