package dev.mozhno.spi;

/**
 * Service Provider Interface for billing and plan management.
 * <p>
 * In the Open Core architecture, the community edition allows all features
 * without restrictions. Licensed editions can provide an SPI implementation
 * that enforces tier-based feature access, member limits, and flag quotas
 * based on the workspace's active subscription plan.
 */
public interface BillingSpi {

    /**
     * Checks whether the given feature is allowed for the workspace under its
     * current plan.
     *
     * @param workspaceId the workspace identifier
     * @param featureKey  the feature to check (e.g. {@code "advanced-audit"})
     * @return {@code true} if the feature is allowed
     */
    boolean isFeatureAllowed(String workspaceId, String featureKey);

    /**
     * Retrieves the current plan information for the given workspace.
     *
     * @param workspaceId the workspace identifier
     * @return the workspace's current plan details
     */
    PlanInfo getPlan(String workspaceId);

    /**
     * Summary of a workspace's subscription plan.
     *
     * @param tier        the plan tier name (e.g. {@code "STARTER"}, {@code "ENTERPRISE"})
     * @param memberLimit maximum number of team members allowed
     * @param flagLimit   maximum number of feature flags allowed
     */
    record PlanInfo(String tier, int memberLimit, int flagLimit) {}
}
