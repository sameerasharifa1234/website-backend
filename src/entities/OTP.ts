
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class OTP {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 150 })
  email!: string;

  @Column({ type: "varchar", length: 6 })
  otp!: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at!: Date;

  @Column({ type: "timestamp", nullable: true })
  expires_at!: Date;

  @Column({ type: "varchar", length: 6, nullable: true })
  verify_otp!: string | null;
}