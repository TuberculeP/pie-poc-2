import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class DirectMessage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToMany(() => User, (user) => user.id)
  sender: User;

  @OneToMany(() => User, (user) => user.id)
  receiver: User;

  @Column("text")
  body: string;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;

  @Column({ default: true })
  isActive: boolean;
}
