import { getCollection, getEntry, render, type CollectionEntry } from 'astro:content';
import { siteConfig } from '@/config';
import { generateHomeSEO } from '@/utils/seo';
import { isValidDate, processPost, shouldShowPost, shouldShowContent, sortPostsByDate } from '@/utils/markdown';
import { hasProjectCategories } from '@/utils/categories';
import { findTranslation, getLocalisedPosts, postSlug, type Locale, lt } from '@/utils/i18n';

type SpecialEntry = CollectionEntry<'special'>;

// `processPost` is typed as `any` upstream; keep the loose type local.
type ProcessedPost = Awaited<ReturnType<typeof processPost>>;

export interface HomeData {
  locale: Locale;
  processedPosts: ProcessedPost[];
  featuredPost: ProcessedPost | null;
  previewPosts: ProcessedPost[];
  featuredProjects: CollectionEntry<'projects'>[];
  projectsHaveCategories: boolean;
  featuredDocs: CollectionEntry<'docs'>[];
  homeBlurbContent: SpecialEntry | null;
  HomeBlurbContent: Awaited<ReturnType<typeof render>>['Content'] | null;
  hasFeaturedPost: boolean;
  hasRecentPosts: boolean;
  hasProjects: boolean;
  hasDocs: boolean;
  contentTypesCount: number;
  useSpecialTreatment: boolean;
  onlyBlurbContent: boolean;
  seoData: ReturnType<typeof generateHomeSEO>;
  structuredData: Record<string, unknown>;
}

async function resolveFeaturedPost(
  locale: Locale,
  localePosts: ProcessedPost[],
): Promise<ProcessedPost | null> {
  const cfg = siteConfig.homeOptions.featuredPost;
  if (!cfg.enabled) return null;

  if (cfg.type === 'latest') {
    return localePosts[0] ?? null;
  }

  if (cfg.type === 'featured' && cfg.slug) {
    const wanted = cfg.slug;
    // 1. Try direct match in current locale (compare bare slug, strip locale prefix).
    const direct = localePosts.find((p) => postSlug(p) === wanted);
    if (direct) return direct;

    // 2. Look up across all posts (any locale), then find translation in current locale.
    const all = await getCollection('posts');
    const anyMatch = all.find((p) => postSlug(p) === wanted);
    if (anyMatch) {
      if (anyMatch.data.lang === locale) {
        // Match exists in this locale but was filtered out (e.g. draft) — don't fall through to it.
        return localePosts.find((p) => p.id === anyMatch.id) ?? null;
      }
      const counterpart = await findTranslation(anyMatch);
      if (counterpart) {
        const processed = localePosts.find((p) => p.id === counterpart.id);
        if (processed) return processed;
      }
    }

    // 3. Fall back to latest in current locale.
    return localePosts[0] ?? null;
  }

  return null;
}

export async function getHomeData(locale: Locale, currentUrl: string): Promise<HomeData> {
  const isDev = import.meta.env.DEV;

  const localisedPosts = await getLocalisedPosts(locale);
  const visiblePosts = localisedPosts.filter((post) => shouldShowPost(post, isDev));
  const sortedPosts = sortPostsByDate(visiblePosts);
  const processedPosts = (await Promise.all(
    sortedPosts.map(async (post) => await processPost(post)),
  )) as ProcessedPost[];

  const featuredPost = await resolveFeaturedPost(locale, processedPosts);

  const previewPosts = featuredPost
    ? processedPosts
        .filter((p) => p.id !== featuredPost.id)
        .slice(0, siteConfig.homeOptions.recentPosts.count)
    : processedPosts.slice(0, siteConfig.homeOptions.recentPosts.count);

  let featuredProjects: CollectionEntry<'projects'>[] = [];
  let projectsHaveCategories = false;
  if (siteConfig.homeOptions.projects.enabled && siteConfig.optionalContentTypes.projects) {
    const allProjects = await getCollection('projects');
    const visibleProjects = allProjects.filter((project) => shouldShowContent(project, isDev));
    projectsHaveCategories = hasProjectCategories(visibleProjects);

    const featuredOnly = visibleProjects.filter((project) => project.data.featured);
    const sortByDate = (a: CollectionEntry<'projects'>, b: CollectionEntry<'projects'>) => {
      const dateA = isValidDate(a.data.date) ? a.data.date : new Date(0);
      const dateB = isValidDate(b.data.date) ? b.data.date : new Date(0);
      return dateB.getTime() - dateA.getTime();
    };

    if (featuredOnly.length > 0) {
      featuredProjects = featuredOnly.sort(sortByDate).slice(0, siteConfig.homeOptions.projects.count);
    } else if (visibleProjects.length > 0) {
      featuredProjects = visibleProjects.sort(sortByDate).slice(0, siteConfig.homeOptions.projects.count);
    }
  }

  let featuredDocs: CollectionEntry<'docs'>[] = [];
  if (siteConfig.homeOptions.docs.enabled && siteConfig.optionalContentTypes.docs) {
    const allDocs = await getCollection('docs');
    const visibleDocs = allDocs.filter((doc) => shouldShowContent(doc, isDev));
    const featuredOnly = visibleDocs.filter((doc) => doc.data.featured);
    const sortByLastModified = (a: CollectionEntry<'docs'>, b: CollectionEntry<'docs'>) => {
      const dateA = a.data.lastModified && isValidDate(a.data.lastModified) ? a.data.lastModified : new Date(0);
      const dateB = b.data.lastModified && isValidDate(b.data.lastModified) ? b.data.lastModified : new Date(0);
      return dateB.getTime() - dateA.getTime();
    };

    if (featuredOnly.length > 0) {
      featuredDocs = featuredOnly.sort(sortByLastModified).slice(0, siteConfig.homeOptions.docs.count);
    } else if (visibleDocs.length > 0) {
      featuredDocs = visibleDocs.sort(sortByLastModified).slice(0, siteConfig.homeOptions.docs.count);
    }
  }

  let homeBlurbContent: SpecialEntry | null = null;
  let HomeBlurbContent: HomeData['HomeBlurbContent'] = null;
  if (siteConfig.homeOptions.blurb.placement !== 'none') {
    try {
      const entry = await getEntry('special', 'home');
      if (entry) {
        homeBlurbContent = entry;
        const { Content } = await render(entry);
        HomeBlurbContent = Content;
      }
    } catch {
      // Blurb is optional — silently fall back to no blurb.
    }
  }

  const hasFeaturedPost = Boolean(siteConfig.homeOptions.featuredPost.enabled && featuredPost);
  const hasRecentPosts = siteConfig.homeOptions.recentPosts.enabled && previewPosts.length > 0;
  const hasProjects = siteConfig.homeOptions.projects.enabled && featuredProjects.length > 0;
  const hasDocs = siteConfig.homeOptions.docs.enabled && featuredDocs.length > 0;
  const contentTypesCount = [hasFeaturedPost, hasRecentPosts, hasProjects, hasDocs].filter(Boolean).length;
  const useSpecialTreatment = contentTypesCount === 1;
  const onlyBlurbContent = Boolean(
    contentTypesCount === 0 && siteConfig.homeOptions.blurb.placement !== 'none' && HomeBlurbContent,
  );

  const seoData = generateHomeSEO(currentUrl, locale);
  const localisedHomepageTitle = lt(locale, siteConfig.homepageTitle);
  if (localisedHomepageTitle) seoData.title = localisedHomepageTitle;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: lt(locale, siteConfig.title),
    description: lt(locale, siteConfig.description),
    url: siteConfig.site,
    author: {
      '@type': 'Person',
      name: siteConfig.author,
    },
    publisher: {
      '@type': 'Organization',
      name: lt(locale, siteConfig.title),
      url: siteConfig.site,
    },
  };

  return {
    locale,
    processedPosts,
    featuredPost,
    previewPosts,
    featuredProjects,
    projectsHaveCategories,
    featuredDocs,
    homeBlurbContent,
    HomeBlurbContent,
    hasFeaturedPost,
    hasRecentPosts,
    hasProjects,
    hasDocs,
    contentTypesCount,
    useSpecialTreatment,
    onlyBlurbContent,
    seoData,
    structuredData,
  };
}
