import "reflect-metadata";

import { Container } from "typescript-ioc";

import { HairResApi} from "./hairResApi";

const app: HairResApi = Container.get(HairResApi);
app.start();