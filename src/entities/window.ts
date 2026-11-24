import type { Rel } from "@mikro-orm/core";
import {
  Entity,
  OneToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/decorators/legacy";
import { Door } from "./door";

@Entity()
export class Window {
  @PrimaryKey()
  id!: number;

  @Property()
  tint!: string;

  @OneToOne(() => Door, { inversedBy: "window" })
  door!: Rel<Door>;
}
