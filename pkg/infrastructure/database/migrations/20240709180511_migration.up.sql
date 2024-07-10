-- create "events" table
CREATE TABLE "events" ("id" character varying NOT NULL, "name" character varying NULL, "created_by" character varying NULL, "paid_by" character varying NOT NULL, "amount" bigint NOT NULL, "group_id" character varying NULL, "evented_at" timestamptz NOT NULL, "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" timestamptz NULL, PRIMARY KEY ("id"));
-- create "friends" table
CREATE TABLE "friends" ("uid" character varying NOT NULL, "friend_uid" character varying NOT NULL, PRIMARY KEY ("uid", "friend_uid"));
-- create "group_users" table
CREATE TABLE "group_users" ("uid" character varying NOT NULL, "group_id" character varying NOT NULL, "owner" boolean NOT NULL, PRIMARY KEY ("uid", "group_id"));
-- create "groups" table
CREATE TABLE "groups" ("id" character varying NOT NULL, "name" character varying NULL, "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" timestamptz NULL, PRIMARY KEY ("id"));
-- create "payments" table
CREATE TABLE "payments" ("id" character varying NOT NULL, "evented_by" character varying NOT NULL, "paid_by" character varying NOT NULL, "paid_to" character varying NOT NULL, "paid_at" timestamptz NOT NULL, "amount" bigint NOT NULL, "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" timestamptz NULL, PRIMARY KEY ("id"));
