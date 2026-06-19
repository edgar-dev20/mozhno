package dev.mozhno;

/**
 * Central registry of Spring cache names used throughout the application.
 * <p>
 * Every {@code @Cacheable} / {@code @CacheEvict} annotation MUST reference
 * a constant from this class rather than a raw string literal, so that
 * renaming a cache is a single-line change.
 */
public final class CacheNames {

    private CacheNames() {}

    /** Cached response of {@code GET /api/client/features} (ClientFlagService). */
    public static final String CLIENT_FLAGS = "clientFlags";

    /** Cached context definition lookups (ContextDefinitionRepository). */
    public static final String CONTEXT_DEFINITIONS = "contextDefinitions";

    /** Cached flag lookups (FlagRepository). */
    public static final String FLAGS = "flags";

    /** Cached tag lookups (TagRepository). */
    public static final String TAGS = "tags";

    /** Cached segment lookups (SegmentRepository). */
    public static final String SEGMENTS = "segments";

    /** Cached project lookups (ProjectRepository). */
    public static final String PROJECTS = "projects";
}
