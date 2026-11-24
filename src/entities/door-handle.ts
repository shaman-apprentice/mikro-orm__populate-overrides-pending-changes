import type { Rel } from "@mikro-orm/core";
import {
  Entity,
  OneToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/decorators/legacy";
import { Door } from "./door";

@Entity()
export class DoorHandle {
  @PrimaryKey()
  id!: number;

  @Property()
  shape!: string;

  @OneToOne(() => Door, { inversedBy: "handle" })
  door!: Rel<Door>;
}
