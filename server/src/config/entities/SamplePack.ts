import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { SampleFolder } from "./SampleFolder";

@Entity("sample_packs")
export class SamplePack {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  author: string;

  @Column({ nullable: true })
  cover: string;

  @Column({ default: false })
  featured: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => SampleFolder, (folder) => folder.pack)
  folders: SampleFolder[];
}
