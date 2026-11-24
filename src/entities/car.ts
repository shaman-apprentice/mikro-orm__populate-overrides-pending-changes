import { Collection } from "@mikro-orm/core";
import {
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/decorators/legacy";
import { Door } from "./door";

@Entity()
export class Car {
  @PrimaryKey()
  id!: number;

  @Property()
  model!: string;

  @OneToMany(() => Door, (door) => door.car)
  doors = new Collection<Door>(this);
}
