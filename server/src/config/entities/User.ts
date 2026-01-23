import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  ManyToOne,
  OneToOne,
  CreateDateColumn,
  JoinTable,
} from "typeorm";
import { Post } from "./Post";
import { Subscription } from "./Subscription";
import { DirectMessage } from "./DirectMessage";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true, unique: true })
  googleId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: "ROLE_USER" })
  role: string;

  @OneToMany(() => User, (user) => user.id)
  following: User[];

  @ManyToMany(() => User, (user) => user.following)
  followers: User[];

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @ManyToMany(() => Post, (post) => post.likedBy)
  @JoinTable()
  likedPosts: Post[];

  // Subscription
  @OneToOne(() => Subscription, (subscription) => subscription.users)
  subscription: Subscription;

  @ManyToOne(() => DirectMessage, (directMessage) => directMessage.sender)
  sentMessages: DirectMessage[];

  @ManyToOne(() => DirectMessage, (directMessage) => directMessage.receiver)
  receivedMessages: DirectMessage[];

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  resetToken: string;

  @Column({ nullable: true })
  resetTokenExpiry: Date;
}
