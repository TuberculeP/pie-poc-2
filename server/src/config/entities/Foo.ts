import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Foo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bar: string;
}
