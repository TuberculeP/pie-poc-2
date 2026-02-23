import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { SamplePack } from "./SamplePack";
import { AudioSample } from "./AudioSample";

@Entity("sample_folders")
export class SampleFolder {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ default: 0 })
  order: number;

  @ManyToOne(() => SamplePack, (pack) => pack.folders, { onDelete: "CASCADE" })
  pack: SamplePack;

  @Column()
  packId: string;

  @OneToMany(() => AudioSample, (sample) => sample.folder)
  samples: AudioSample[];
}
