import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn } from 'typeorm';

@Entity('send-logs')
export class SendLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ length: 32 })
  type: string;

  @Index()
  @Column({ length: 64 })
  to: string;

  @Index()
  @Column({ nullable: false })
  status?: boolean;

  @Index()
  @Column({ nullable: true, length: 128 })
  messageId?: string;

  @Index()
  @Column({ nullable: true })
  message?: string;

  @Column({ type: 'json', nullable: true })
  payload?: any;

  @Column({ type: 'json', nullable: true })
  response?: any;

  @CreateDateColumn()
  createdAt?: Date;
}
