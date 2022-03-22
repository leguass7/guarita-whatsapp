import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, OneToMany } from 'typeorm';

import { EmailSent } from '#/useCases/email/email-sent/email-sent.entity';

export type EnventType = 'success' | 'failed' | 'trying';
@Entity('send-logs')
export class SendLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ length: 32, nullable: true })
  provider: string;

  @Index()
  @Column({ length: 64 })
  to: string;

  @Index()
  @Column({ nullable: false })
  status?: boolean;

  @Column({ nullable: true, enum: ['success', 'failed', 'trying'], type: 'enum' })
  eventType?: EnventType;

  @Column({ nullable: true })
  jobId?: string;

  @Column({ nullable: true, default: 0 })
  attemptsMade?: number;

  @Index()
  @Column({ length: 32, nullable: true })
  type?: string;

  @Index()
  @Column({ nullable: true })
  message?: string;

  @Column({ type: 'datetime', nullable: true })
  scheduled?: Date;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
    precision: null,
  })
  createdAt?: Date;

  @Index()
  @Column({ nullable: true, length: 128 })
  messageId?: string;

  @Column({ type: 'json', nullable: true })
  payload?: any;

  @Column({ type: 'json', nullable: true })
  response?: any;

  @OneToMany(() => EmailSent, emailSent => emailSent.sendLogs)
  emails?: EmailSent[];
}
