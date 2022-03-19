import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { SendLog } from '#/useCases/send/send-log/send-log.entity';

@Entity('email-sent')
export class EmailSent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  jobId?: string;

  @Column({ nullable: true })
  sendLogId?: string;

  @Column({ nullable: true, default: 0 })
  countRead?: number;

  @ManyToOne(() => SendLog, sendlog => sendlog.emails, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'sendLogId' })
  sendLogs: SendLog;
}
