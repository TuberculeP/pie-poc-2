import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  ManyToOne,
  OneToOne,
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

  @Column()
  password: string;

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

  @ManyToOne(() => Post, (post) => post.author)
  posts: Post[];

  @ManyToMany(() => Post, (post) => post.likedBy)
  likedPosts: Post[];

  // Subscription
  @OneToOne(() => Subscription, (subscription) => subscription.users)
  subscription: Subscription;

  @ManyToOne(() => DirectMessage, (directMessage) => directMessage.sender)
  sentMessages: DirectMessage[];

  @ManyToOne(() => DirectMessage, (directMessage) => directMessage.receiver)
  receivedMessages: DirectMessage[];
}
