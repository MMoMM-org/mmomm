import { buildRssFeed } from "../utils/feeds";

export async function GET() {
  return buildRssFeed("de");
}
