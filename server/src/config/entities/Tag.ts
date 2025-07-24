import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Post } from "./Post";

@Entity()
export class Tag {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => Post, (post) => post.tags)
  posts: Post[];

  @ManyToMany(() => Post, (post) => post.highlight_on_tag, { nullable: true })
  highlights: Post[];
}
