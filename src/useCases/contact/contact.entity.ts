import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

// FIXME: Falta campo
@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Index()
  @Column({ length: 64 })
  whatsapp: string;

  @Index()
  @Column({ nullable: true, length: 128 })
  maxbotId?: string;

  @Column({ nullable: true })
  brCpf?: string;

  @Column({ nullable: true })
  brCnpj?: string;

  @Column({ nullable: true })
  company?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  mobilePhone?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ type: 'text', nullable: true })
  obs?: string;
}
