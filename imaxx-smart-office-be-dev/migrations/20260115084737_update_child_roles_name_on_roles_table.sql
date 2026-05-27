-- Modify "parent_child_roles" table
ALTER TABLE "parent_child_roles" DROP CONSTRAINT "fk_parent_child_roles_parent_child_roles", ADD CONSTRAINT "fk_parent_child_roles_child_roles" FOREIGN KEY ("child_role_id") REFERENCES "roles" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
