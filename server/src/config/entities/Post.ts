import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  Column,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Tag } from "./Tag";

@Entity()
export class Post {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToMany(() => User, (user) => user.id)
  author: User;

  @ManyToMany(() => User, (user) => user.likedPosts)
  likedBy: User[];

  @Column("text")
  body: string;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Tag, (tag) => tag.posts)
  tags: Tag[];

  @OneToMany(() => Post, (post) => post.id, { nullable: true })
  comment_of?: Post;

  @ManyToMany(() => Post, (post) => post.comment_of)
  comments: Post[];

  @Column({ default: false })
  is_highlight: boolean;

  @ManyToMany(() => Tag, (tag) => tag.highlights, { nullable: true })
  highlight_on_tag: Tag[];

  @Column({ default: false })
  pinned_by_user: boolean;
}
