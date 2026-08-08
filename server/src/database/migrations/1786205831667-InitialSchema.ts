import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1786205831667 implements MigrationInterface {
  name = 'InitialSchema1786205831667';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'editor', 'viewer')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'editor', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_109638590074998bb72a2f2cf0" ON "users"  ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tenants_pix_key_type_enum" AS ENUM('cpf', 'email', 'phone', 'random')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tenants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "pix_key" character varying, "pix_key_type" "public"."tenants_pix_key_type_enum", "pix_qr_code_url" character varying, "pix_beneficiary" character varying, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2310ecc5cb8be427097154b18fc" UNIQUE ("slug"), CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "clients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "cpf" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_b48860677afe62cd96e12659482" UNIQUE ("email"), CONSTRAINT "UQ_4245ac34add1ceeb505efc98777" UNIQUE ("cpf"), CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'uploaded', 'approved', 'rejected', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ticket_id" uuid NOT NULL, "amount" numeric(10,2) NOT NULL, "status" "public"."payments_status_enum" NOT NULL DEFAULT 'pending', "pix_receipt_url" character varying, "rejection_reason" character varying, "expires_at" TIMESTAMP NOT NULL, "uploaded_at" TIMESTAMP, "reviewed_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_aac3e9d7b82ecaeb355f2f4e0d1" UNIQUE ("ticket_id"), CONSTRAINT "REL_aac3e9d7b82ecaeb355f2f4e0d" UNIQUE ("ticket_id"), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pricing_rules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ticket_type_id" uuid NOT NULL, "form_field_id" uuid NOT NULL, "field_value" character varying NOT NULL, "price" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fda27bb8db4630894decda61ff6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."event_form_fields_type_enum" AS ENUM('text', 'select', 'number', 'email', 'phone')`,
    );
    await queryRunner.query(
      `CREATE TABLE "event_form_fields" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "event_id" uuid NOT NULL, "label" character varying NOT NULL, "type" "public"."event_form_fields_type_enum" NOT NULL, "options" jsonb, "is_required" boolean NOT NULL DEFAULT false, "display_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8b805f01a6de0273a74d4940441" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ticket_form_responses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ticket_id" uuid NOT NULL, "form_field_id" uuid NOT NULL, "value" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4dcf0907afab087ad0faafd793c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tickets_status_enum" AS ENUM('reserved', 'confirmed', 'used', 'cancelled', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tickets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ticket_type_id" uuid NOT NULL, "client_id" uuid NOT NULL, "code" character varying NOT NULL, "final_price" numeric(10,2) NOT NULL, "status" "public"."tickets_status_enum" NOT NULL DEFAULT 'reserved', "checked_in_at" TIMESTAMP, "expires_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c6e20a830c0f8b571abd331b775" UNIQUE ("code"), CONSTRAINT "PK_343bc942ae261cf7a1377f48fd0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a95369aeea12da7fde110e95e0" ON "tickets"  ("ticket_type_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ab0f4c7161f0a5c178d229e354" ON "tickets"  ("client_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "ticket_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "event_id" uuid NOT NULL, "name" character varying NOT NULL, "base_price" numeric(10,2) NOT NULL DEFAULT '0', "quantity" integer, "sold" integer NOT NULL DEFAULT '0', "display_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5510ce7e18a4edc648c9fbfc283" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9dfa62b35548ea1e0b7e4675b2" ON "ticket_types"  ("event_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."events_location_type_enum" AS ENUM('presencial', 'online')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."events_status_enum" AS ENUM('draft', 'published', 'ongoing', 'finished', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."events_capacity_mode_enum" AS ENUM('per_ticket_type', 'total')`,
    );
    await queryRunner.query(
      `CREATE TABLE "events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid NOT NULL, "title" character varying NOT NULL, "slug" character varying NOT NULL, "description" text, "start_date" TIMESTAMP NOT NULL, "end_date" TIMESTAMP NOT NULL, "location" character varying, "location_type" "public"."events_location_type_enum" NOT NULL DEFAULT 'presencial', "cover_image_url" character varying, "status" "public"."events_status_enum" NOT NULL DEFAULT 'draft', "capacity_mode" "public"."events_capacity_mode_enum" NOT NULL DEFAULT 'per_ticket_type', "total_capacity" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_05bd884c03d3f424e2204bd14cd" UNIQUE ("slug"), CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_098a5d310151924de7369f1336" ON "events"  ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "certificates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "event_id" uuid NOT NULL, "client_id" uuid NOT NULL, "code" character varying NOT NULL, "pdf_url" character varying, "issued_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e9e6937f74d9a653f0fc3299132" UNIQUE ("code"), CONSTRAINT "PK_e4c7e31e2144300bea7d89eb165" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_109638590074998bb72a2f2cf08" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_aac3e9d7b82ecaeb355f2f4e0d1" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pricing_rules" ADD CONSTRAINT "FK_6b01260bec23077f7bab9b463d8" FOREIGN KEY ("ticket_type_id") REFERENCES "ticket_types"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pricing_rules" ADD CONSTRAINT "FK_c3018a3abb4cd41002f8ac6b28c" FOREIGN KEY ("form_field_id") REFERENCES "event_form_fields"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_form_fields" ADD CONSTRAINT "FK_6ae3563f7f2cba796788b30a3be" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket_form_responses" ADD CONSTRAINT "FK_5d536b3af68315483c35e5943a6" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket_form_responses" ADD CONSTRAINT "FK_9ecbf087b0532d4ca6d15ffe5b3" FOREIGN KEY ("form_field_id") REFERENCES "event_form_fields"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD CONSTRAINT "FK_a95369aeea12da7fde110e95e00" FOREIGN KEY ("ticket_type_id") REFERENCES "ticket_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD CONSTRAINT "FK_ab0f4c7161f0a5c178d229e3541" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket_types" ADD CONSTRAINT "FK_9dfa62b35548ea1e0b7e4675b20" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "FK_098a5d310151924de7369f1336a" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificates" ADD CONSTRAINT "FK_c80071624695307551da71fb10e" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificates" ADD CONSTRAINT "FK_cc2652847e8c5464cdfa443885d" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "certificates" DROP CONSTRAINT "FK_cc2652847e8c5464cdfa443885d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "certificates" DROP CONSTRAINT "FK_c80071624695307551da71fb10e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" DROP CONSTRAINT "FK_098a5d310151924de7369f1336a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket_types" DROP CONSTRAINT "FK_9dfa62b35548ea1e0b7e4675b20"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" DROP CONSTRAINT "FK_ab0f4c7161f0a5c178d229e3541"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" DROP CONSTRAINT "FK_a95369aeea12da7fde110e95e00"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket_form_responses" DROP CONSTRAINT "FK_9ecbf087b0532d4ca6d15ffe5b3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket_form_responses" DROP CONSTRAINT "FK_5d536b3af68315483c35e5943a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_form_fields" DROP CONSTRAINT "FK_6ae3563f7f2cba796788b30a3be"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pricing_rules" DROP CONSTRAINT "FK_c3018a3abb4cd41002f8ac6b28c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pricing_rules" DROP CONSTRAINT "FK_6b01260bec23077f7bab9b463d8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_aac3e9d7b82ecaeb355f2f4e0d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_109638590074998bb72a2f2cf08"`,
    );
    await queryRunner.query(`DROP TABLE "certificates"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_098a5d310151924de7369f1336"`,
    );
    await queryRunner.query(`DROP TABLE "events"`);
    await queryRunner.query(`DROP TYPE "public"."events_capacity_mode_enum"`);
    await queryRunner.query(`DROP TYPE "public"."events_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."events_location_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9dfa62b35548ea1e0b7e4675b2"`,
    );
    await queryRunner.query(`DROP TABLE "ticket_types"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ab0f4c7161f0a5c178d229e354"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a95369aeea12da7fde110e95e0"`,
    );
    await queryRunner.query(`DROP TABLE "tickets"`);
    await queryRunner.query(`DROP TYPE "public"."tickets_status_enum"`);
    await queryRunner.query(`DROP TABLE "ticket_form_responses"`);
    await queryRunner.query(`DROP TABLE "event_form_fields"`);
    await queryRunner.query(`DROP TYPE "public"."event_form_fields_type_enum"`);
    await queryRunner.query(`DROP TABLE "pricing_rules"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
    await queryRunner.query(`DROP TABLE "clients"`);
    await queryRunner.query(`DROP TABLE "tenants"`);
    await queryRunner.query(`DROP TYPE "public"."tenants_pix_key_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_109638590074998bb72a2f2cf0"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
