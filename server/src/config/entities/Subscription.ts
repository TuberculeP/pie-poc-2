import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  digest_id: string;

  @Column()
  name: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => User, (user) => user.subscription)
  users: User[];
}
