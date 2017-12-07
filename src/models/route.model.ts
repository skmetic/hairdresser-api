import { IRouterContext } from "koa-router";

export class Route {
    public path: string;
    public method: string;
    public action: (ctx: IRouterContext) => void;

    public static newRoute(path: string, method: string, action: (ctx: IRouterContext) => void) {
        const route = new Route();
        route.action = action;
        route.method = method;
        route.path = path;
        return route;
    }
}
