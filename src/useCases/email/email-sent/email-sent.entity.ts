import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { SendLog } from '#/useCases/send/send-log/send-log.entity';

@Entity('email-sent')
export class EmailSent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  jobId?: string;

  @Column({ type: 'uuid', nullable: true })
  sendLogId?: string;

  @Column({ nullable: true, default: 0 })
  countRead?: number;

  @Column({ type: 'timestamp', nullable: true, precision: null, default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @Column({ type: 'timestamp', nullable: true, precision: null, default: null, onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;

  @ManyToOne(() => SendLog, sendlog => sendlog.emails, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'sendLogId' })
  sendLog: SendLog;
}
