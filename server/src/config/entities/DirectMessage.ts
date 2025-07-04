import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
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

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @Column({ default: true })
  isActive: boolean;
}
