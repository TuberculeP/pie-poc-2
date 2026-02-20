import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { User } from "./User";
import { DirectMessage } from "./DirectMessage";

@Entity()
@Unique(["user", "message"])
export class MessageLike {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.messageLikes)
  user: User;

  @ManyToOne(() => DirectMessage, (message) => message.likes)
  message: DirectMessage;

  @CreateDateColumn()
  createdAt: Date;
}
