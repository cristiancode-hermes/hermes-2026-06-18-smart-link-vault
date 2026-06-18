import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import type { Link } from '../links/link.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  name: string;

  @Column({ length: 7, nullable: true })
  color: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany('Link', 'tags')
  links: Link[];
}
