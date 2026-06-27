package dev.mozhno.spi.impl;

import org.springframework.stereotype.Component;
import dev.mozhno.spi.QuotaSpi;

/**
 * No-operation {@link QuotaSpi} implementation that allows all resource
 * creation without limits.
 *
 * <p>This is the community-edition quota provider. All quota checks return
 * {@link Allowed} unconditionally, and the default audit retention period is
 * 365 days. Licensed editions may replace this with a provider that enforces
 * tier-based limits on flags, segments, contexts, users, and API keys.
 */
@Component
public class NoOpQuotaProvider implements QuotaSpi {

    /**
     * Checks whether a new feature flag can be created in the given project.
     *
     * @param projectId the project identifier
     * @return always {@link Allowed}
     * @implNote The OSS implementation always allows flag creation without
     *           any limit.
     */
    @Override
    public QuotaResult canCreateFlag(Integer projectId) {
        return new Allowed();
    }

    /**
     * Checks whether a new segment can be created in the given project.
     *
     * @param projectId the project identifier
     * @return always {@link Allowed}
     * @implNote The OSS implementation always allows segment creation without
     *           any limit.
     */
    @Override
    public QuotaResult canCreateSegment(Integer projectId) {
        return new Allowed();
    }

    /**
     * Checks whether a new context can be created in the given project.
     *
     * @param projectId the project identifier
     * @return always {@link Allowed}
     * @implNote The OSS implementation always allows context creation without
     *           any limit.
     */
    @Override
    public QuotaResult canCreateContext(Integer projectId) {
        return new Allowed();
    }

    /**
     * Checks whether a new environment can be created in the given project.
     *
     * @param projectId the project identifier
     * @return always {@link Allowed}
     * @implNote The OSS implementation always allows environment creation
     *           without any limit.
     */
    @Override
    public QuotaResult canCreateEnvironment(Integer projectId) {
        return new Allowed();
    }

    /**
     * Checks whether a new user can be created in the given project.
     *
     * @param projectId the project identifier
     * @return always {@link Allowed}
     * @implNote The OSS implementation always allows user creation without
     *           any limit.
     */
    @Override
    public QuotaResult canCreateUser(Integer projectId) {
        return new Allowed();
    }

    /**
     * Checks whether a new API key can be created in the given project.
     *
     * @param projectId the project identifier
     * @return always {@link Allowed}
     * @implNote The OSS implementation always allows API key creation without
     *           any limit.
     */
    @Override
    public QuotaResult canCreateApiKey(Integer projectId) {
        return new Allowed();
    }

    /**
     * Returns the number of days audit records are retained.
     *
     * @param projectId the project identifier
     * @return {@code 365} days of audit retention by default
     * @implNote The OSS implementation returns a fixed 365-day retention
     *           period for all projects.
     */
    @Override
    public int getAuditRetentionDays(Integer projectId) {
        return 365;
    }
}
