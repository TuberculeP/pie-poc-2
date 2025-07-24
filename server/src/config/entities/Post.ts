import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinTable,
} from "typeorm";
import { User } from "./User";
import { Tag } from "./Tag";

@Entity()
export class Post {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.posts)
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
  @JoinTable()
  tags: Tag[];

  @ManyToOne(() => Post, (post) => post.comments, { nullable: true })
  comment_of?: Post;

  @OneToMany(() => Post, (post) => post.comment_of)
  comments?: Post[];

  @Column({ default: false })
  is_highlight: boolean;

  @ManyToMany(() => Tag, (tag) => tag.highlights, { nullable: true })
  highlight_on_tag: Tag[];

  @Column({ default: false })
  pinned_by_user: boolean;
}
