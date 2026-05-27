-- Create "parent_child_roles" table
CREATE TABLE "parent_child_roles" (
  "parent_role_id" uuid NOT NULL,
  "child_role_id" uuid NOT NULL,
  PRIMARY KEY ("parent_role_id", "child_role_id"),
  CONSTRAINT "fk_parent_child_roles_parent_child_roles" FOREIGN KEY ("child_role_id") REFERENCES "roles" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_parent_child_roles_role" FOREIGN KEY ("parent_role_id") REFERENCES "roles" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
