package dev.mozhno.spi;

/**
 * Service Provider Interface for resource quotas.
 * <p>
 * In the Open Core architecture, the community edition imposes no quotas.
 * Licensed editions can provide an SPI implementation that enforces
 * per-workspace limits on the number of flags, segments, contexts, environments,
 * users, and API keys, as well as audit log retention, based on the active plan.
 */
public interface QuotaSpi {

    /**
     * Checks whether a new feature flag can be created in the given project.
     *
     * @param projectId the project identifier
     * @return {@link Allowed} or a {@link Blocked} result with limit details
     */
    QuotaResult canCreateFlag(Integer projectId);

    /**
     * Checks whether a new segment can be created in the given project.
     *
     * @param projectId the project identifier
     * @return {@link Allowed} or a {@link Blocked} result with limit details
     */
    QuotaResult canCreateSegment(Integer projectId);

    /**
     * Checks whether a new context can be created in the given project.
     *
     * @param projectId the project identifier
     * @return {@link Allowed} or a {@link Blocked} result with limit details
     */
    QuotaResult canCreateContext(Integer projectId);

    /**
     * Checks whether a new environment can be created in the given project.
     *
     * @param projectId the project identifier
     * @return {@link Allowed} or a {@link Blocked} result with limit details
     */
    QuotaResult canCreateEnvironment(Integer projectId);

    /**
     * Checks whether a new user can be added to the given project.
     *
     * @param projectId the project identifier
     * @return {@link Allowed} or a {@link Blocked} result with limit details
     */
    QuotaResult canCreateUser(Integer projectId);

    /**
     * Checks whether a new API key can be created in the given project.
     *
     * @param projectId the project identifier
     * @return {@link Allowed} or a {@link Blocked} result with limit details
     */
    QuotaResult canCreateApiKey(Integer projectId);

    /**
     * Returns the number of days that audit log records are retained.
     *
     * @param projectId the project identifier
     * @return audit retention period in days
     */
    int getAuditRetentionDays(Integer projectId);

    /**
     * Sealed hierarchy representing the outcome of a quota check.
     */
    sealed interface QuotaResult permits Allowed, Blocked {}

    /**
     * Indicates that the quota check passed and the resource can be created.
     */
    record Allowed() implements QuotaResult {}

    /**
     * Indicates that the quota check failed with details about the exceeded limit.
     *
     * @param resourceType the type of resource that was blocked
     * @param current      the current count of that resource
     * @param limit        the maximum allowed count
     * @param planName     the name of the plan that imposes the limit
     */
    record Blocked(String resourceType, int current, int limit, String planName) implements QuotaResult {}
}
