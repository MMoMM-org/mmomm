import type { APIRoute } from "astro";
import { buildAtomFeed } from "../../utils/feeds";

export const GET: APIRoute = async () => buildAtomFeed("en");
